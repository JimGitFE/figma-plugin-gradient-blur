// Dependencies
import React, { createContext, HTMLAttributes, ReactNode, useCallback, useEffect, useMemo, useRef } from "react"
// Internal
import { isBetween } from "./utils"
import styles from "./draggable.module.scss"
import { useReorder } from "./Container"
import { useScrollCtx } from "./CustomScroll"
import { clamp } from "@/utils"

/** Required props */
interface SourceProps {
   /** Represents item slot */
   uniqueId: number
}

interface ItemProps extends SourceProps, HTMLAttributes<HTMLDivElement> {
   children: ReactNode
   /** Attach listener to item (alt: `use) */
   draggable?: boolean
   /** On item grab / drag clamp to container boundary */
   boundClamp?: boolean
}

// Misconception uniqueId might have empty steps, index represents the actual position
/** Reorder Item - slot sorted by uniqueId, relatively positioned by index */
function Item({ draggable, boundClamp = true, children, ...atts }: ItemProps) {
   const { containerRef } = useScrollCtx()
   const [{ uniqueId, index, onDragStart, isActive, rect }, { sources, active, hovering }, { scrolledY, ...internal }] = useReorder()

   /** Item draggable Y clamp boundaries */
   const bounds = useMemo(() => {
      if (!(rect && boundClamp) || !containerRef.current) return {}
      return { min: scrolledY - 1, max: containerRef.current.clientHeight - rect.height + scrolledY + 1 }
   }, [internal.slotRects, scrolledY, containerRef, rect])

   /* 1 Item Positioning (floating) */

   /** Offset based on elements before */
   const offset = useMemo(() => {
      return internal.slotRects.slice(0, index).reduce((totalHeight, rect) => totalHeight + rect.height, 0)
   }, [index, internal.slotRects, rect]) // rect? makes sure it updates on initialization (useLatyoutEffect)

   /** Calculate Y position of item */
   const calcPosY = useCallback(
      (translate: number) => {
         // Make room for empty slot (draggable new position)
         const direction = index > active.index ? -1 : 1
         const moveOut = isBetween(index, active.index, hovering.index) ? direction * active.rect?.height : 0

         if (isActive) return clamp(translate + offset, bounds)

         return moveOut + offset
      },
      [index, offset, hovering, bounds]
   )

   /* 2 keep item z on top after drop */

   // Previous active item
   const wasPrevActiveRef = useRef(false)
   // prettier-ignore
   useEffect(() => {active.uniqueId !== -1 && (wasPrevActiveRef.current = isActive)}, [active.uniqueId])

   /* 3 Item motion react to Scroll / Drag / remapping */

   // TODO: Smooth translate3d on wheel scroll (custom motion with lerp & targetPos)

   // TODO: observe resizes of items

   const handleItemRef = useCallback(
      (node: HTMLDivElement | null) => {
         if (node) {
            internal.itemNodesRef.current[index] = node
         } else {
            internal.itemNodesRef.current.splice(index, 1)
         }
      },
      [sources]
   )

   // uselaytouteffect measures heights on sources recalc & tops
   // enable slot refs (hoverings)
   const handleSlotRef = useCallback(
      (node: HTMLDivElement | null) => {
         const indexOfSlot = [...sources].sort((a, b) => a.uniqueId - b.uniqueId).findIndex((slot) => slot.uniqueId === uniqueId)
         if (node) {
            internal.slotNodesRef.current[indexOfSlot] = node
         } else {
            internal.slotNodesRef.current.splice(index, 1)
         }
      },
      [sources, rect?.height]
   )

   isActive && console.log("ac", offset, active.dy, active.scrolledY, internal.itemRects, internal.slotRects)
   return (
      <>
         {/* 1 Item */}
         <div
            ref={handleItemRef}
            onMouseDown={(e) => draggable && onDragStart(e, uniqueId)}
            className={`z-6 w-100 ${isActive && styles.active} ${styles.floating} ${atts.className}`}
            style={{
               position: "absolute",
               top: 0,
               transform: `translateY(${calcPosY(active.dy + active.scrolledY)}px)`,
               zIndex: wasPrevActiveRef.current && 5,
               // transition: lifecycle >= 2 && behaviourSmooth ? "transform 130ms ease-in-out" : "",
               // transition: !(offset > 0) && "none" // fix transition, goes from 0 to 100
            }}
         >
            <DragContext.Provider value={{ onDragStart: (e) => onDragStart(e, uniqueId), isActive }}>{children}</DragContext.Provider>
         </div>
         {/* 2 display block representation of item */}
         <div
            // ref callback called every time component changes identity
            ref={handleSlotRef}
            style={{
               display: "block",
               height: rect?.height, // TODO> variable heights on items
            }}
            className={`w-100 pos-relative ${isActive && "reorder-slot-active"} ${index + " " + uniqueId}`}
         />
      </>
   )
}

interface DragContextProps {
   onDragStart: (e: EventFor<MouseEvent>) => void
   /** Item being dragged */
   isActive: boolean
}

/** Individual item drag context */
const DragContext = createContext<DragContextProps | undefined>(undefined)

/** Custom Drag handle */
const useDragHandle = () => {
   const context = React.useContext(DragContext)
   if (!context) throw new Error("useCustomDrag must be used within a Reorder.Item")
   return context
}

export type { ItemProps, SourceProps }
export { Item, useDragHandle }
