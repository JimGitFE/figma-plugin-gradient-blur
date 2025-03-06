// Dependencies
import React, { useRef, useState, createContext, HTMLAttributes, ReactElement } from "react"
// Internal
import useDrag from "@/hooks/useDrag"
import { type ItemProps, Item } from "./Item"
import { reorder } from "./utils"
import { useResizeRect } from "@/hooks/useResizeRect"

type ItemRepresentation = { uniqueId: number; index: number }

interface ContainerProps<T extends { uniqueId: number }> extends HTMLAttributes<HTMLDivElement> {
   children: ReactElement<ItemProps, typeof Item>[]
   sources: T[]
   /** reordered data source */
   onReorder: (dataSources: T[]) => void
}

/** Drag Reorder & Provider */
function Container<T extends { uniqueId: number }>({ children, sources, onReorder, ...atts }: ContainerProps<T>) {
   // Dimensions
   const itemRefs = useRef([]) // sorted by index

   /** Drag Tracker (resets on container resize) */
   // const milestoneRef = useRef<number>(0) // 0: idle (item rect might shift), 1: drag start (nodes settled), 2: moved
   const [milestone, setMilestone] = useState(0)
   const assignOnce = [milestone === 0, milestone === 1]

   // Resize Observer
   const containerRef = useRef<HTMLDivElement>(null)
   useResizeRect({
      ref: containerRef,
      callback: () => {
         // set stage to 0?
         // request render?
         // item subs to milestone & setsPosY?
         // console.log("resize on containers", newRect)
      },
   })

   // Draggables
   const [active, setActive] = useState({ uniqueId: -1, index: -1 })
   const [hovering, setHovering] = useState({ uniqueId: -1, index: -1 }) // hovering slot index

   const onDragStart = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, uniqueId: number) => {
      recalculateItemRects() // new hover slots relative positions
      if (assignOnce[0]) setMilestone(1) // define item dimensions
      setActive({ uniqueId, index: indexFromId(uniqueId) })
      setHovering({ uniqueId, index: indexFromId(uniqueId) })
      dragStartCallback(e)
   }

   const move = (e: MouseEvent) => {
      if (assignOnce[1]) setMilestone(2) // define item transition
      const uniqueId = hoveringItemId(e)
      setHovering({ uniqueId, index: indexFromId(uniqueId) })
   }

   const up = () => {
      onReorder(reorder(sources, active.index, hovering.index))
      setActive({ uniqueId: -1, index: -1 })
      setHovering({ uniqueId: -1, index: -1 })
   }

   // Mouse
   const { dy, onDragStart: dragStartCallback } = useDrag({ axis: "y", callbacks: { move, up } })

   const recalculateItemRects = () => {
      itemRefs.current.forEach((ref, i) => ref.node && (itemRefs.current[i].rect = ref.node.getBoundingClientRect()))
   }

   /** Placeholder that should activate to accomodate dragged item (always represents an index of item[]) */
   const hoveringItemId = (e: MouseEvent) => {
      /** Index of the item currently being hovered */
      let index = itemRefs.current.findIndex((ref) => ref?.rect && e.clientY >= ref.rect.top && e.clientY <= ref.rect.bottom)
      if (index === -1) index = itemRefs.current[indexFromId(1)]?.rect.top >= e.clientY ? 0 : itemRefs.current.length - 1
      return children[index].props.uniqueId
   }

   // Util
   const indexFromId = (uniqueId: number) => children.findIndex((it) => it.props.uniqueId === uniqueId)

   return (
      <div {...atts} ref={containerRef} className="pos-relative">
         {[...children]
            .sort((a, b) => a.props.uniqueId - b.props.uniqueId)
            .map((item, index) => (
               <ReorderContext.Provider
                  key={item.props.uniqueId ?? index}
                  // Context
                  value={[
                     // Item
                     {
                        /** Handles display order */
                        index: indexFromId(item.props.uniqueId),
                        /** state key control */
                        uniqueId: item.props.uniqueId ?? index,
                        /** DOM rect dimensions */
                        rect: itemRefs.current[indexFromId(item.props.uniqueId)]?.rect,
                        /** drag handle Init */
                        onDragStart,
                        isActive: active.uniqueId === item.props.uniqueId,
                     },
                     // State
                     {
                        hovering,
                        active,
                        activeDy: dy,
                     },
                     // Internal
                     {
                        itemRefs,
                        recalculateRects: recalculateItemRects,
                        milestone,
                     },
                  ]}
                  // Children
                  children={item}
               />
            ))}
      </div>
   )
}

type ReorderContextProps = [
   /** Item */
   {
      index: number
      uniqueId: number
      rect: DOMRect
      /** Item being dragged */
      isActive: boolean
      onDragStart: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, uniqueId: number) => void
   },
   /** State */
   {
      /** hovering slot index */
      hovering: ItemRepresentation
      active: ItemRepresentation
      /** travelled Y distance for active item */
      activeDy: number
   },
   /** Internal */
   {
      itemRefs: React.MutableRefObject<{ rect: DOMRect; node: HTMLDivElement }[]>
      recalculateRects: () => void
      /**  0: idle, 1: drag start, 2: moved */
      milestone: number
   }
]

/** Reorder Internal Context */
const ReorderContext = createContext<ReorderContextProps | undefined>(undefined)

/** Expose internal reorder context state as destructured array */
function useReorder() {
   const context = React.useContext(ReorderContext)
   if (!context) throw new Error("Item must be used within a Reorder.Container")
   // type Return = [(typeof context)["item"], (typeof context)["state"], (typeof context)["internal"]]
   // return [{ ...context.item }, { ...context.state }, { ...context.internal }] as Return
   return context
}

export { Container, ReorderContext, useReorder }
