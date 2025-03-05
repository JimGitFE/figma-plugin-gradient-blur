// Dependencies
import React, { createContext, ReactNode, useEffect } from "react"
// Internal
import { isBetween } from "./utils"
import styles from "./draggable.module.scss"
import { ReorderContext } from "./Container"

interface ItemProps {
   children: ReactNode
   uniqueId: number
   draggable?: boolean
}

function Item({ children, draggable }: ItemProps) {
   const context = React.useContext(ReorderContext)
   if (!context) throw new Error("Item must be used within a Reorder.Container")
   const [{ onDragStart, isActive, index, uniqueId }, { activeIndx, hoveringIndx, activeDy }] = [context.item, context.state]
   const [activeRect, itemRect] = [context.itemsRef.current.rects[activeIndx], context.itemsRef.current.rects[index]]

   // Make room for empty slot (draggable new position)
   const slotDy = activeIndx < index ? -activeRect?.height : activeRect?.height
   const moveY = isBetween(index, activeIndx, hoveringIndx) ? slotDy : 0

   const prevIndexRef = React.useRef<number>(uniqueId - 1)
   const isDragging = activeIndx !== -1

   const wrapRef = React.useRef<HTMLDivElement>(null)

   const itemWasLastActive = context.prevState.activeUniqueId === uniqueId

   console.log(uniqueId, itemWasLastActive)

   // onDrop fake smooth positioning to new slot
   useEffect(() => {
      const wrapper = wrapRef.current
      const itemDrop = activeIndx === -1

      if (itemDrop && wrapper && context.prevState.activeUniqueId === uniqueId) {
         const dropDy = context.prevState.activeDy
         const avgHeight = 32 // TODO: Assumes same height for all items
         const diffDy = (index - prevIndexRef.current) * avgHeight

         wrapper.style.transition = `transform 0ms linear`
         wrapper.style.transform = `translateY(${dropDy - diffDy}px)` // drop pos

         // Force a reflow
         requestAnimationFrame(() => {
            wrapper.style.transition = `transform 70ms linear`
            wrapper.style.transform = `translateY(${0}px)`
         })
      }
      prevIndexRef.current = index
   }, [activeIndx])

   return (
      <div
         onMouseDown={(e) => draggable && onDragStart(e)}
         style={{
            height: isDragging && itemRect.height,
            width: isDragging && itemRect.width,
         }}
         ref={(node) => (context.itemsRef.current.nodes[index] = node)}
      >
         {/* Draggable Item */}
         <div
            className={`${isActive && styles.active} ${isDragging && styles.floating}`}
            style={{
               zIndex: itemWasLastActive && 87,
               position: isDragging ? "absolute" : "relative",
               transform: `translateY(${isActive ? activeDy : moveY}px)`,
               width: isDragging && itemRect.width,
               height: isDragging && itemRect.height,
            }}
         >
            <div ref={wrapRef}>
               <DragContext.Provider value={{ onDragStart: (e) => onDragStart(e), isActive }}>{children}</DragContext.Provider>
            </div>
         </div>
      </div>
   )
}

interface DragContextProps {
   onDragStart: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
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

export type { ItemProps }
export { Item, useDragHandle }
