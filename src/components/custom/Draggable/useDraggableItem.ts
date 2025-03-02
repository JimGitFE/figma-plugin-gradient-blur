// Dependencies
import React, { useState, useEffect, useRef } from "react"
// Internal
import { reorder } from "./utils"

export interface DraggableProps<T extends {}> {
   sources: T[]
   /** reordered data source */
   onReorder: (dataSources: T[]) => void
}

export function useDraggableItem<T extends {}>({ sources, onReorder }: DraggableProps<T>) {
   // Dimensions
   const itemRefs = useRef({ nodes: [], rects: [] })
   //    const lastDragged = useRef([-1, -1, itemsBoundingRect.current])
   // Draggables
   const [activeIndex, setActiveIndex] = useState(-1)
   const [hoveringIndx, setHoveringIndx] = useState(-1)
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
      onReorder(reorder(sources, activeIndex, hoveringIndx))
      setDownY(0)
      setClientY(0)
      setActiveIndex(-1)
      setHoveringIndx(-1)
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

   return { onDragStart, dy: clientY - downY, activeIndex, hoveringIndx, itemRefs }
}
