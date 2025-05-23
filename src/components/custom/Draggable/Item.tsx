// Dependencies
import React, { createContext, HTMLAttributes, ReactNode, useCallback, useEffect, useMemo, useRef } from "react"
// Internal
import { isBetween } from "./utils"
import styles from "./draggable.module.scss"
import { useReorder } from "./Container"
import { useScrollCtx } from "./CustomScroll"
import { clamp } from "@/utils"
// import { useEventListener } from "@/hooks/useEventListener"

/** Required props */
interface SourceProps {
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
   const [{ uniqueId, index, onDragStart, isActive, rect }, { active, hovering }, { lifecycle, scrolledY, ...internal }] = useReorder()

   // TODO: Smooth translate3d on wheel scroll (custom motion with lerp & targetPos)

   // TODO: observe resizes of items

   /* keep item z on top after drop */

   // Previous active item
   const wasPrevActiveRef = useRef(false)
   // prettier-ignore
   useEffect(() => {active.index !== -1 && (wasPrevActiveRef.current = isActive)}, [active.index])

   /* Item motion react to Scroll / Drag / remapping */

   // Generated by elements above
   const offsetTop = useMemo(() => {
      return internal.itemsRef.current.slice(0, index).reduce((totalHeight, ref) => totalHeight + ref?.rect?.height, 0)
   }, [index, lifecycle])

   // Item draggable Y clamp boundaries
   const bounds = useMemo(() => {
      if (!(rect && boundClamp) || !containerRef.current) return {}
      return { min: scrolledY - 1, max: containerRef.current.clientHeight - rect.height + scrolledY + 1 }
   }, [lifecycle, scrolledY])

   // Calculate Y position of item
   const calcPosY = useCallback(
      (diffScrolledY: number) => {
         if (!rect || lifecycle === 0) internal.recalculateRects() // observer will compute rects after <Item> mounts

         const activeRef = internal.itemsRef.current[active.index]
         // Make room for empty slot (draggable new position)
         const direction = index > active.index ? -1 : 1
         const slotHeight = isBetween(index, active.index, hovering.index) ? direction * activeRef?.rect.height : 0

         return isActive ? clamp(active.dy + offsetTop + diffScrolledY, bounds) : offsetTop + slotHeight
      },
      [index, active.dy, hovering, lifecycle, bounds]
   )

   return (
      <>
         {/* 1 Item */}
         <div
            ref={(node) => node && (internal.itemsRef.current[index] = { ...internal.itemsRef.current[index], node })}
            onMouseDown={(e) => draggable && onDragStart(e, uniqueId)}
            className={`z-6 w-100 ${isActive && styles.active} ${lifecycle >= 2 && styles.floating} ${atts.className}`}
            style={{
               // Apply Floating layout once refs have settled
               position: lifecycle >= 1 ? "absolute" : "relative",
               height: lifecycle >= 1 && rect?.height,
               top: 0,
               transform: lifecycle >= 1 && `translateY(${calcPosY(active.scrolledY)}px)`,
               zIndex: wasPrevActiveRef.current && 5,
               // transition: lifecycle >= 2 && behaviourSmooth ? "transform 130ms ease-in-out" : "",
            }}
         >
            <DragContext.Provider value={{ onDragStart: (e) => onDragStart(e, uniqueId), isActive }}>{children}</DragContext.Provider>
         </div>
         {/* 2 display block representation of item */}
         <div
            style={{
               display: lifecycle >= 1 ? "block" : "none",
               height: rect?.height,
            }}
            className={`w-100 ${isActive && "reorder-slot-active"}`}
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
