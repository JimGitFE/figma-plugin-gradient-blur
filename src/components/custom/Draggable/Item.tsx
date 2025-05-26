// Dependencies
import React, { act, createContext, HTMLAttributes, ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
// Internal
import { isBetween } from "./utils"
import styles from "./draggable.module.scss"
import { useReorder } from "./Container"
import { useScrollCtx } from "./CustomScroll"
import { clamp } from "@/utils"
// import { useEventListener } from "@/hooks/useEventListener"

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
   }, [scrolledY])

   /* 1 Item Positioning (floating) */

   /** Offset based on elements before */
   const offset = useMemo(() => {
      console.log("measure ofset", internal.slotsRef.current, internal.slotsRef.current.slice(0, index).reduce((totalHeight, ref) => totalHeight + ref?.rect.height, 0))
      return internal.slotsRef.current.slice(0, index).reduce((totalHeight, ref) => totalHeight + ref?.rect.height, 0)
   }, [index, internal.slotsRef.current, rect, internal.lifecycle]) // rect? makes sure it updates on initialization (useLatyoutEffect)

   /** Calculate Y position of item */
   const calcPosY = useCallback(
      (translate: number) => {
         // Make room for empty slot (draggable new position)
         const direction = index > active.index ? -1 : 1
         const moveOut = isBetween(index, active.index, hovering.index) ? direction * active.rect?.height : 0

         if (isActive) return clamp(translate + offset, bounds)

         return moveOut + offset
      },
      [index, offset, hovering, bounds, internal.lifecycle]
   )

   /* 2 keep item z on top after drop */

   // Previous active item
   const wasPrevActiveRef = useRef(false)
   // prettier-ignore
   useEffect(() => {active.uniqueId !== -1 && (wasPrevActiveRef.current = isActive)}, [active.uniqueId])

   /* 3 Item motion react to Scroll / Drag / remapping */

   // TODO: Smooth translate3d on wheel scroll (custom motion with lerp & targetPos)

   // TODO: observe resizes of items

   // uselaytouteffect measures heights on sources recalc & tops
   // enable slot refs (hoverings)
   const handleRef = useCallback((node: HTMLDivElement | null) => {
      console.log("handleRef", internal.slotsRef.current,sources)
      if ( node) {
         const indexOfSlot = [...sources].sort((a, b) => a.uniqueId - b.uniqueId).findIndex((slot) => slot.uniqueId === uniqueId)
         internal.slotsRef.current[indexOfSlot] = {node, rect: node?.getBoundingClientRect(), index: indexOfSlot}
      } else {
         internal.slotsRef.current.splice(index, 1)
      }
      internal.setLifecycle((prev) => prev + 1) // trigger rerender
    }, [sources, rect?.height]);    

   //  if(isActive) {
   //     console.warn("for ", uniqueId, " at ", index, calcPosY(active.dy + active.scrolledY), offset) // debug
   //    } else {
   //    console.log("for ", uniqueId, " at ", index, calcPosY(active.dy + active.scrolledY), offset) // debug
   // }
   
   return (
      <>
         {/* 1 Item */}
         <div
            ref={(node) => {
               if (internal.itemsRef.current[index]?.node) return
               if (node) {
                  const rect = node.getBoundingClientRect() // delayed by transform traslate y 0 at initialization
                  internal.itemsRef.current[index] = { node, rect }
               }
            }}
            onMouseDown={(e) => draggable && onDragStart(e, uniqueId)}
            className={`z-6 w-100 ${isActive && styles.active} ${styles.floating} ${atts.className}`}
            style={{
               position: "absolute",
               top: 0,
               transform: `translateY(${calcPosY(active.dy + active.scrolledY)}px)`,
               zIndex: wasPrevActiveRef.current && 5,
               // transition: lifecycle >= 2 && behaviourSmooth ? "transform 130ms ease-in-out" : "",
               // transition: topOffset !== 0 && "none" // fix transition, goes from 0 to 100
            }}
         >
            <DragContext.Provider value={{ onDragStart: (e) => onDragStart(e, uniqueId), isActive }}>{children}</DragContext.Provider>
         </div>
         {/* 2 display block representation of item */}
         <div
         // ref callback called every time component changes identity
         ref={handleRef}
            style={{
               display: "block",
               height: rect?.height, // TODO> variable heights on items
            }}
            className={`w-100 pos-relative ${isActive && "reorder-slot-active"} ${index +" " + uniqueId}`}
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
