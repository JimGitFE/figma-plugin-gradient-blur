import React, { useState, useRef, useEffect } from "react"
import styles from "./draggable.module.scss"

interface Props<T> {
   items: any[]
   source: T[]
   /** reordered data source */
   onReorder: (dataSource: T[]) => void
}

export interface ReorderableItem {
   onDragStart?: (e: MouseEvent | React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => void
   index?: number
   children: React.ReactNode
}

export const Reorderable = <T extends { key: number }>({ items, source, onReorder }: Props<T>) => {
   // Draggables
   const [activeIndex, setActiveIndex] = useState(-1)
   const [hoveringIndx, setHoveringIndx] = useState(-1)
   // Dimensions
   const itemsBoundingRect = useRef([])
   //    const lastDragged = useRef([-1, -1, itemsBoundingRect.current])
   // Mouse
   const [clientY, setClientY] = useState(0)
   const [downY, setDownY] = useState(0)

   const isDragging = activeIndex !== -1

   const onMouseMove = (e) => {
      e.preventDefault()
      setClientY(e.clientY)
      setHoveringIndx(dragItemSlotIndx(e))
   }

   /** Placeholder that should activate to accomodate dragged item (always represents an index of item[]) */
   const dragItemSlotIndx = (e: MouseEvent) => {
      /** Index of the item currently being hovered */
      const hoverIdx = itemsBoundingRect.current.findIndex((rect) => rect && e.clientY >= rect.top && e.clientY <= rect.bottom)
      if (hoverIdx === -1) return itemsBoundingRect.current[0].top >= e.clientY ? 0 : itemsBoundingRect.current.length - 1
      return hoverIdx
   }

   const onMouseUp = () => {
      //   lastDragged.current = [hoveringIndx, activeIndex, itemsBoundingRect.current] // new indx
      onReorder(reorder(source))
      setDownY(0)
      setClientY(0)
      setActiveIndex(-1)
      setHoveringIndx(-1)
   }

   const reorder = (source: T[]): T[] => {
      const sourceCopy = [...source]
      const [movedElement] = sourceCopy.splice(activeIndex, 1)
      sourceCopy.splice(hoveringIndx, 0, movedElement)
      return sourceCopy
   }

   // Listeners
   useEffect(() => {
      if (isDragging) {
         window.addEventListener("mousemove", onMouseMove)
         window.addEventListener("mouseup", onMouseUp)
      } else {
         window.removeEventListener("mousemove", onMouseMove)
         window.removeEventListener("mouseup", onMouseUp)
      }
      return () => {
         window.removeEventListener("mousemove", onMouseMove)
         window.removeEventListener("mouseup", onMouseUp)
      }
   }, [isDragging, activeIndex, hoveringIndx])

   const onDragStart = (e: MouseEvent, index: number) => {
      setDownY(e.clientY)
      setClientY(e.clientY)
      setActiveIndex(index)
      setHoveringIndx(index)
   }

   return (
      <div className="pos-relative">
         {items.map((item, index) => {
            const [activeRect, itemRect] = [itemsBoundingRect.current[activeIndex], itemsBoundingRect.current[index]]

            // Make room for empty slot (draggable new position)
            const slotDy = activeIndex < index ? -activeRect?.height : activeRect?.height
            const moveY = isBetween(index, activeIndex, hoveringIndx) ? slotDy : 0

            const content =
               React.isValidElement(item) &&
               React.cloneElement(item as React.ReactElement<Required<ReorderableItem>>, { onDragStart, index }) // or any prop name you prefer

            return (
               //   {/* Slot */}
               <div
                  key={index}
                  style={{
                     height: isDragging && itemRect.height,
                     width: isDragging && itemRect.width,
                  }}
                  ref={(node) => !isDragging && node && (itemsBoundingRect.current[index] = node.getBoundingClientRect())}
               >
                  {/* Draggable */}
                  <div
                     className={`${styles.draggable} ${activeIndex === index && styles.moving} ${isDragging && styles.dragging}`}
                     style={{
                        position: isDragging ? "absolute" : "relative",
                        transform: `translateY(${activeIndex === index ? clientY - downY : moveY}px)`,
                        width: isDragging && itemRect.width,
                        height: isDragging && itemRect.height,
                     }}
                  >
                     {/* Item JSX */}
                     {content}
                  </div>
               </div>
            )
         })}
      </div>
   )
}

// Utils

function isBetween(idxMid, idxA, idxB) {
   const low = Math.min(idxA, idxB)
   const high = Math.max(idxA, idxB)
   return idxMid >= low && idxMid <= high
}
