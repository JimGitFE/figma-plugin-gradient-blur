// Dependencies
import React, { useRef, useState, createContext, HTMLAttributes, ReactElement } from "react"
// Internal
import useDrag from "@/hooks/useDrag"
import { type ItemProps, Item } from "./Item"
import { reorder } from "./utils"

interface ContainerProps<T extends { uniqueId: number }> extends HTMLAttributes<HTMLDivElement> {
   children: ReactElement<ItemProps, typeof Item>[]
   sources: T[]
   /** reordered data source */
   onReorder: (dataSources: T[]) => void
}

/** Drag Reorder & Provider */
function Container<T extends { uniqueId: number }>({ children, sources, onReorder, ...atts }: ContainerProps<T>) {
   // Dimensions
   const itemsRef = useRef({ nodes: [], rects: [], uniqueIds: [], indexes: [] }) // sorted by uniqueId
   const slotsRef = useRef({ nodes: [], rects: [], uniqueIds: [], indexes: [] }) // sorted by uniqueId
   const [prevState, setPrevState] = useState({ activeDy: null, activeUniqueId: -1 })

   // Draggables
   const [activeId, setActiveId] = useState(-1)
   const [activeIndx, setActiveIndx] = useState(-1)
   const [hoveringId, setHoveringId] = useState(-1) // hovering slot index
   const [hoveringIndx, setHoveringIndx] = useState(-1) // hovering slot index

   const onDragStart = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, uniqueId: number) => {
      // setPrevState({ activeDy: null, activeUniqueId: sources[uniqueId].uniqueId })
      console.log("onDragStart", uniqueId)
      recalculateItemRects()
      setActiveId(uniqueId)
      setActiveIndx(children.findIndex((it) => it.props.uniqueId === uniqueId))
      setHoveringId(uniqueId)
      setHoveringIndx(children.findIndex((it) => it.props.uniqueId === uniqueId))
      dragStartCallback(e)
   }

   const move = (e: MouseEvent) => {
      setPrevState((prev) => ({ ...prev, activeDy: dy }))
      const hoverId = mouseOverSlotIndx(e)
      setHoveringId(hoverId)
      setHoveringIndx(children.findIndex((it) => it.props.uniqueId === hoverId))
   }

   const up = () => {
      console.log("drop")
      console.log(sources)
      onReorder(reorder(sources, activeIndx, hoveringIndx))
      console.log("new sources ", reorder(sources, activeIndx, hoveringIndx))
      setActiveId(-1)
      setActiveIndx(-1)
      setHoveringId(-1)
      setHoveringIndx(-1)
   }

   // Mouse
   const { dy, onDragStart: dragStartCallback } = useDrag({ axis: "y", callbacks: { move, up } })

   const recalculateItemRects = () => {
      itemsRef.current.nodes.forEach((node, i) => node && (itemsRef.current.rects[i] = node.getBoundingClientRect()))
      slotsRef.current.nodes.forEach((node, i) => node && (slotsRef.current.rects[i] = node.getBoundingClientRect()))
   }

   /** Placeholder that should activate to accomodate dragged item (always represents an index of item[]) */
   const mouseOverSlotIndx = (e: MouseEvent) => {
      /** Index of the item currently being hovered */
      const hoverIdx = itemsRef.current.rects.findIndex((rect) => rect && e.clientY >= rect.top && e.clientY <= rect.bottom)
      if (hoverIdx === -1) return itemsRef.current.rects[0].top >= e.clientY ? 0 : itemsRef.current.rects.length - 1
      return hoverIdx
   }

   const rectsByIndx = itemsRef.current.nodes
      .map((node, uniqueId) => {
         return {
            node,
            rect: node ? node.getBoundingClientRect() : null,
            index: children.findIndex((it) => it.props.uniqueId === uniqueId),
         }
      })
      .sort((a, b) => a.index - b.index)

   return (
      <div {...atts} className="pos-relative">
         {children.map((item, index) => (
            <ReorderContext.Provider
               key={item.props.uniqueId ?? index}
               // Context
               value={{
                  item: {
                     isActive: activeId === item.props.uniqueId,
                     /** Handles display order */
                     index: children.findIndex((it) => it.props.uniqueId === item.props.uniqueId),
                     /** state key control */
                     uniqueId: item.props.uniqueId ?? index,
                     onDragStart,
                  },
                  state: {
                     hoveringId,
                     hoveringIndx,
                     activeId,
                     activeIndx,
                     activeDy: dy,
                  },
                  itemsRef,
                  slotsRef,
                  rectsByIndx: rectsByIndx ?? [],
                  prevState,
               }}
               // Children
               children={item}
            />
         ))}
      </div>
   )
}

interface ReorderContextProps {
   item: {
      index: number
      uniqueId: number
      /** Item being dragged */
      isActive: boolean
      onDragStart: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, uniqueId: number) => void
   }
   state: {
      /** hovering slot index */
      hoveringId: number
      hoveringIndx: number
      activeId: number
      activeIndx: number
      /** travelled Y distance for active item */
      activeDy: number
   }
   itemsRef: React.MutableRefObject<{ nodes: any[]; rects: any[]; uniqueIds: number[]; indexes: number[] }>
   slotsRef: React.MutableRefObject<{ nodes: any[]; rects: any[]; uniqueIds: number[]; indexes: number[] }>
   rectsByIndx: { node: any; rect: DOMRect }[]
   prevState: {
      activeDy?: number
      activeUniqueId: number
   }
}

/** Reorder Internal Context */
const ReorderContext = createContext<ReorderContextProps | undefined>(undefined)

export { Container, ReorderContext }
