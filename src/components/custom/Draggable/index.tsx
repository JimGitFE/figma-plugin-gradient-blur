// Dependencies
import React, { createContext } from "react"
// Internal
import { isBetween } from "./utils"
import { DraggableProps, useDraggableItem } from "./useDraggableItem"
import styles from "./draggable.module.scss"

interface DragContextProps {
   onDragStart: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
   /** Item being dragged */
   isActive: boolean
}

/** Individual item drag context */
const DragContext = createContext<DragContextProps | undefined>(undefined)

// Container

interface Props<T> extends React.HTMLAttributes<HTMLDivElement>, DraggableProps<T> {
   children: React.ReactElement<{ draggable?: boolean; id: number }>[]
}

/** Drag Provider */
export const Reorderable = <T extends {}>({ children, sources, onReorder, ...atts }: Props<T>) => {
   const { dy, activeIndex, hoveringIndx, onDragStart, itemRefs } = useDraggableItem({ sources, onReorder })

   const isDragging = activeIndex !== -1

   return (
      <div className="pos-relative" {...atts}>
         {children.map((item, index) => {
            const [activeRect, itemRect] = [itemRefs.current.rects[activeIndex], itemRefs.current.rects[index]]
            const isActive = activeIndex === index

            // Make room for empty slot (draggable new position)
            const slotDy = activeIndex < index ? -activeRect?.height : activeRect?.height
            const moveY = isBetween(index, activeIndex, hoveringIndx) ? slotDy : 0

            return (
               // Slot Item Container
               <div
                  key={item.props.id}
                  onMouseDown={(e) => item.props.draggable && onDragStart(e, index)}
                  style={{
                     height: isDragging && itemRect.height,
                     width: isDragging && itemRect.width,
                  }}
                  ref={(node) => (itemRefs.current.nodes[index] = node)}
               >
                  {/* Draggable Item */}
                  <div
                     className={`${isActive && styles.active} ${isDragging && styles.floating}`}
                     style={{
                        position: isDragging ? "absolute" : "relative",
                        transform: `translateY(${isActive ? dy : moveY}px)`,
                        width: isDragging && itemRect.width,
                        height: isDragging && itemRect.height,
                     }}
                  >
                     <DragContext.Provider value={{ onDragStart: (e) => onDragStart(e, index), isActive }}>{item}</DragContext.Provider>
                  </div>
               </div>
            )
         })}
      </div>
   )
}

/** Custom Drag handle */
export const useDrag = () => {
   const context = React.useContext(DragContext)
   if (!context) throw new Error("useDrag must be used within a DragProvider")
   return context
}
