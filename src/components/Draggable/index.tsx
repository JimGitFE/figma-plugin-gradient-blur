import React, { useState, useRef, useEffect, createContext } from "react"
import styles from "./draggable.module.scss"

// Context

interface DragContextProps {
   onDragStart: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}

const DragContext = createContext<DragContextProps | undefined>(undefined)

/** Custom Drag handle */
export const useDrag = () => {
   const context = React.useContext(DragContext)
   if (!context) throw new Error("useDrag must be used within a DragProvider")
   return context
}

// Container

interface Props<T> extends React.HTMLAttributes<HTMLDivElement> {
   children: React.ReactElement<{ isDrag?: boolean }>[]
   sources: T[]
   /** reordered data source */
   onReorder: (dataSources: T[]) => void
}

/** Drag Provider */
export const Reorderable = <T extends {}>({ children, sources, onReorder, ...atts }: Props<T>) => {
   // Draggables
   const [activeIndex, setActiveIndex] = useState(-1)
   const [hoveringIndx, setHoveringIndx] = useState(-1)

   // Dimensions
   const itemRefs = useRef({ nodes: [], rects: [] })
   //    const lastDragged = useRef([-1, -1, itemsBoundingRect.current])

   // Mouse
   const [clientY, setClientY] = useState(0)
   const [downY, setDownY] = useState(0)

   const isDragging = activeIndex !== -1

   const recalculateItemRects = () => {
      itemRefs.current.nodes.forEach((node, i) => node && (itemRefs.current.rects[i] = node.getBoundingClientRect()))
   }

   const onDragStart = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {
      recalculateItemRects()
      setDownY(e.clientY)
      setClientY(e.clientY)
      setActiveIndex(index)
      setHoveringIndx(index)
   }

   const onMouseMove = (e) => {
      e.preventDefault()
      setClientY(e.clientY)
      setHoveringIndx(dragItemSlotIndx(e))
   }

   /** Placeholder that should activate to accomodate dragged item (always represents an index of item[]) */
   const dragItemSlotIndx = (e: MouseEvent) => {
      /** Index of the item currently being hovered */
      const hoverIdx = itemRefs.current.rects.findIndex((rect) => rect && e.clientY >= rect.top && e.clientY <= rect.bottom)
      if (hoverIdx === -1) return itemRefs.current.rects[0].top >= e.clientY ? 0 : itemRefs.current.rects.length - 1
      return hoverIdx
   }

   const onMouseUp = () => {
      //   lastDragged.current = [hoveringIndx, activeIndex, itemsBoundingRect.current] // new indx
      onReorder(reorder(sources))
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

   return (
      <div className="pos-relative" {...atts}>
         {children.map((item, index) => {
            const [activeRect, itemRect] = [itemRefs.current.rects[activeIndex], itemRefs.current.rects[index]]

            // Make room for empty slot (draggable new position)
            const slotDy = activeIndex < index ? -activeRect?.height : activeRect?.height
            const moveY = isBetween(index, activeIndex, hoveringIndx) ? slotDy : 0

            return (
               // Slot Item Container
               <div
                  key={index}
                  onMouseDown={(e) => item.props.isDrag && onDragStart(e, index)}
                  style={{
                     height: isDragging && itemRect.height,
                     width: isDragging && itemRect.width,
                  }}
                  ref={(node) => (itemRefs.current.nodes[index] = node)}
               >
                  {/* Draggable Item */}
                  <div
                     className={`${styles.draggable} ${activeIndex === index && styles.moving} ${isDragging && styles.dragging}`}
                     style={{
                        position: isDragging ? "absolute" : "relative",
                        transform: `translateY(${activeIndex === index ? clientY - downY : moveY}px)`,
                        width: isDragging && itemRect.width,
                        height: isDragging && itemRect.height,
                     }}
                  >
                     <DragContext.Provider value={{ onDragStart: (e) => onDragStart(e, index) }}>{item}</DragContext.Provider>
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
