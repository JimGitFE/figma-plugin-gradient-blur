// Dependencies
import React, { createContext, ReactNode, useEffect, useRef, useState } from "react"
// Internal
import { isBetween } from "./utils"
import styles from "./draggable.module.scss"
import { useReorder } from "./Container"
import { useScrollCtx } from "./CustomScroll"

/** Required props */
interface SourceProps {
   uniqueId: number
}

interface ItemProps extends SourceProps {
   children: ReactNode
   draggable?: boolean
}

// Misconception uniqueId might have empty steps, index represents the actual position
/** Reorder Item - slot sorted by uniqueId, relatively positioned by index */
function Item({ draggable, children }: ItemProps) {
   const { scrolledY } = useScrollCtx()
   const [{ uniqueId, index, onDragStart, isActive, rect }, { active, hovering }, { lifecycle, ...internal }] = useReorder()
   const [posY, setPosY] = useState(null) // makes posY controlled (double render)

   /* Item reacts to Scroll */
   const [scrollTop, setScrollTop] = useState(0)
   const prevScrollY = useRef(scrolledY)

   useEffect(() => {
      // TODO smooth posY while scrolling
      updateScrollTop(prevScrollY.current)
      scrolledY !== prevScrollY.current && (prevScrollY.current = scrolledY)
   }, [scrolledY, isActive])

   const updateScrollTop = (prevScrollY: number) => {
      if (isActive) {
         setScrollTop((prev) => {
            return prev + scrolledY - prevScrollY
         })
      } else {
         setScrollTop(0)
      }
   }

   /* keep item z on top after drop */
   const wasPrevActiveRef = useRef(false)
   // prettier-ignore
   useEffect(() => {active.index !== -1 && (wasPrevActiveRef.current = isActive)}, [active.index])

   // TODO: observe resizes of items

   useEffect(() => {
      if (!rect || lifecycle === 0) internal.recalculateRects() // observer will compute rects after <Item> mounts

      const activeRef = internal.itemRefs.current[active.index]
      // Make room for empty slot (draggable new position)
      const direction = index > active.index ? -1 : 1
      const slotHeight = isBetween(index, active.index, hovering.index) ? direction * activeRef?.rect.height : 0
      /** Generated by elements above */
      const offsetTop = internal.itemRefs.current.slice(0, index).reduce((totalHeight, ref) => totalHeight + ref?.rect?.height, 0)

      setPosY(isActive ? active.dy + offsetTop + scrollTop : offsetTop + slotHeight)
   }, [index, active, hovering, lifecycle, scrollTop])

   return (
      <>
         {/* 1 Item */}
         <div
            style={{
               // Apply Floating layout once refs have settled
               position: lifecycle >= 1 ? "absolute" : "relative",
               height: lifecycle >= 1 && rect?.height,
               top: 0,
               transform: lifecycle >= 1 && `translateY(${posY}px)`,
               zIndex: wasPrevActiveRef.current && 5,
            }}
            className={`z-6 w-100 ${isActive && styles.active} ${lifecycle >= 2 && styles.floating}`}
            onMouseDown={(e) => draggable && onDragStart(e, uniqueId)}
            ref={(node) => node && (internal.itemRefs.current[index] = { ...internal.itemRefs.current[index], node })}
         >
            <DragContext.Provider value={{ onDragStart: (e) => onDragStart(e, uniqueId), isActive }}>{children}</DragContext.Provider>
         </div>
         {/* 2 display block representation of item */}
         <div
            style={{
               display: lifecycle >= 1 ? "block" : "none",
               height: rect?.height,
               // opacity: uniqueId / 10,
               opacity: 0,
            }}
            className={`w-100 bg-red`}
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
