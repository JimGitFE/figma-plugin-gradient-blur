// Dependencies
import React, { useState, useRef } from "react"
// Internal
import { reorder } from "./utils"

import useDrag from "@/hooks/useDrag"

export interface DraggableProps<T extends {}> {
   sources: T[]
   /** reordered data source */
   onReorder: (dataSources: T[]) => void
}

/** useDrag extension */
export function useDraggableItem<T extends {}>({ sources, onReorder }: DraggableProps<T>) {
   // Dimensions
   const itemRefs = useRef({ nodes: [], rects: [] })
   //    const lastDragged = useRef([-1, -1, itemsBoundingRect.current])

   // Draggables
   const [activeIndex, setActiveIndex] = useState(-1)
   const [hoveringIndx, setHoveringIndx] = useState(-1) // hovering slot index

   const onDragStart = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {
      recalculateItemRects()
      setActiveIndex(index)
      setHoveringIndx(index)
      dragStartCallback(e)
   }

   const move = (e: MouseEvent) => {
      setHoveringIndx(mouseOverSlotIndx(e))
   }

   const up = () => {
      onReorder(reorder(sources, activeIndex, hoveringIndx))
      setActiveIndex(-1)
      setHoveringIndx(-1)
   }

   // Mouse
   const { dy, onDragStart: dragStartCallback } = useDrag({ axis: "y", callbacks: { move, up } })

   const recalculateItemRects = () => {
      itemRefs.current.nodes.forEach((node, i) => node && (itemRefs.current.rects[i] = node.getBoundingClientRect()))
   }

   /** Placeholder that should activate to accomodate dragged item (always represents an index of item[]) */
   const mouseOverSlotIndx = (e: MouseEvent) => {
      /** Index of the item currently being hovered */
      const hoverIdx = itemRefs.current.rects.findIndex((rect) => rect && e.clientY >= rect.top && e.clientY <= rect.bottom)
      if (hoverIdx === -1) return itemRefs.current.rects[0].top >= e.clientY ? 0 : itemRefs.current.rects.length - 1
      return hoverIdx
   }

   return { onDragStart, dy, activeIndex, hoveringIndx, itemRefs }
}
