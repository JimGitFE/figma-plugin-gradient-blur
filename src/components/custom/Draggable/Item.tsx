// Dependencies
import React, { createContext, ReactNode } from "react"
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
   const [{ onDragStart, isActive, index }, { activeIndx, hoveringIndx, activeDy }] = [context.item, context.state]
   const [activeRect, itemRect] = [context.itemsRef.current.rects[activeIndx], context.itemsRef.current.rects[index]]

   // Make room for empty slot (draggable new position)
   const slotDy = activeIndx < index ? -activeRect?.height : activeRect?.height
   const moveY = isBetween(index, activeIndx, hoveringIndx) ? slotDy : 0

   const isDragging = activeIndx !== -1

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
               position: isDragging ? "absolute" : "relative",
               transform: `translateY(${isActive ? activeDy : moveY}px)`,
               width: isDragging && itemRect.width,
               height: isDragging && itemRect.height,
            }}
         >
            <DragContext.Provider value={{ onDragStart: (e) => onDragStart(e), isActive }}>{children}</DragContext.Provider>
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
