// Dependencies
import React, { useRef, useState, createContext, HTMLAttributes, ReactElement } from "react"
// Internal
import { reorder } from "./utils"
import useDrag from "@/hooks/useDrag"
import { type ItemProps, Item } from "./Item"

interface ContainerProps<T> extends HTMLAttributes<HTMLDivElement> {
   children: ReactElement<ItemProps, typeof Item>[]
   sources: T[]
   /** reordered data source */
   onReorder: (dataSources: T[]) => void
}

/** Drag Reorder & Provider */
function Container<T extends {}>({ children, sources, onReorder, ...atts }: ContainerProps<T>) {
   // Dimensions
   const itemsRef = useRef({ nodes: [], rects: [] })
   //    const lastDragged = useRef([-1, -1, itemsBoundingRect.current])

   // Draggables
   const [activeIndx, setActiveIndx] = useState(-1)
   const [hoveringIndx, setHoveringIndx] = useState(-1) // hovering slot index

   const onDragStart = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {
      recalculateItemRects()
      setActiveIndx(index)
      setHoveringIndx(index)
      dragStartCallback(e)
   }

   const move = (e: MouseEvent) => {
      setHoveringIndx(mouseOverSlotIndx(e))
   }

   const up = () => {
      onReorder(reorder(sources, activeIndx, hoveringIndx))
      setActiveIndx(-1)
      setHoveringIndx(-1)
   }

   // Mouse
   const { dy, onDragStart: dragStartCallback } = useDrag({ axis: "y", callbacks: { move, up } })

   const recalculateItemRects = () => {
      itemsRef.current.nodes.forEach((node, i) => node && (itemsRef.current.rects[i] = node.getBoundingClientRect()))
   }

   /** Placeholder that should activate to accomodate dragged item (always represents an index of item[]) */
   const mouseOverSlotIndx = (e: MouseEvent) => {
      /** Index of the item currently being hovered */
      const hoverIdx = itemsRef.current.rects.findIndex((rect) => rect && e.clientY >= rect.top && e.clientY <= rect.bottom)
      if (hoverIdx === -1) return itemsRef.current.rects[0].top >= e.clientY ? 0 : itemsRef.current.rects.length - 1
      return hoverIdx
   }

   return (
      <div className="pos-relative" {...atts}>
         {children.map((item, index) => (
            <ReorderContext.Provider
               key={item.props.uniqueId ?? index}
               value={{
                  item: {
                     isActive: activeIndx === index,
                     index: index,
                     onDragStart: (e) => onDragStart(e, index),
                  },
                  state: {
                     hoveringIndx,
                     activeIndx,
                     activeDy: dy,
                  },
                  itemsRef,
               }}
            >
               {item}
            </ReorderContext.Provider>
         ))}
      </div>
   )
}

interface ReorderContextProps {
   item: {
      index: number
      /** Item being dragged */
      isActive: boolean
      onDragStart: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
   }
   state: {
      /** hovering slot index */
      hoveringIndx: number
      activeIndx: number
      /** travelled Y distance for active item */
      activeDy: number
   }
   itemsRef: React.MutableRefObject<{ nodes: any[]; rects: any[] }>
}

/** Reorder Internal Context */
const ReorderContext = createContext<ReorderContextProps | undefined>(undefined)

export { Container, ReorderContext }
