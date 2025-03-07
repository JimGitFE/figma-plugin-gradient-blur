// Dependencies
import React, { useRef, useState, createContext, HTMLAttributes, ReactElement } from "react"
// Internal
import useDrag from "@/hooks/useDrag"
import { type ItemProps, Item } from "./Item"
import { reorder } from "./utils"
import { useResizeObserver } from "@/hooks/useResizeObserver"
import { useEventListener } from "@/hooks/useEventListener"

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
   const [milestone, setMilestone] = useState<0 | 1 | 2>(0)

   const containerRef = useRef<HTMLDivElement>(null)
   // prettier-ignore
   /* Resize Observer - calc hover slots relative positions */
   useResizeObserver({ref: containerRef, callback: () => {recalculateItemRects(), setMilestone(0)}})

   // prettier-ignore
   /* Initialize - define item dimensions / item transition  */
   useEventListener("mousemove", () => {setMilestone(1), requestAnimationFrame(() => setMilestone(2))}, { conditional: milestone === 0 })

   // Draggables
   const [active, setActive] = useState({ uniqueId: -1, index: -1 })
   const [hovering, setHovering] = useState({ uniqueId: -1, index: -1 }) // hovering slot index

   // Mouse
   const onDragStart = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, uniqueId: number) => {
      // recalculateItemRects() // new hover slots relative positions
      setActive({ uniqueId, index: indexFromId(uniqueId) })
      setHovering({ uniqueId, index: indexFromId(uniqueId) })
      dragStartCallback(e)
   }
   const move = (e: MouseEvent) => {
      const uniqueId = hoveringItemId(e)
      setHovering({ uniqueId, index: indexFromId(uniqueId) })
   }
   const up = () => {
      onReorder(reorder(sources, active.index, hovering.index))
      setActive({ uniqueId: -1, index: -1 })
      setHovering({ uniqueId: -1, index: -1 })
   }
   const { dy, onDragStart: dragStartCallback } = useDrag({ axis: "y", callbacks: { move, up } })

   /** Placeholder that should activate to accomodate dragged item (always represents an index of item[]) */
   const hoveringItemId = (e: MouseEvent) => {
      /** Index of the item currently being hovered */
      let index = itemRefs.current.findIndex((ref) => ref?.rect && e.clientY >= ref.rect.top && e.clientY <= ref.rect.bottom)
      if (index === -1) index = itemRefs.current[indexFromId(1)]?.rect.top >= e.clientY ? 0 : itemRefs.current.length - 1
      return children[index].props.uniqueId
   }

   // Utils
   const recalculateItemRects = () => {
      itemRefs.current.forEach((ref, i) => ref.node && (itemRefs.current[i].rect = ref.node.getBoundingClientRect()))
   }
   const indexFromId = (uniqueId: number) => children.findIndex((it) => it.props.uniqueId === uniqueId)

   return (
      <div {...atts} ref={containerRef} className="pos-relative">
         {[...children]
            .sort((a, b) => a.props.uniqueId - b.props.uniqueId)
            .map((item, sortedIndex) => (
               <ReorderContext.Provider
                  // If uniqueId sequential then sortedIndex === uniqueId - 1
                  key={item.props.uniqueId ?? sortedIndex}
                  // Context
                  value={[
                     // Item
                     {
                        /** Handles display order */
                        index: indexFromId(item.props.uniqueId),
                        /** state key control */
                        uniqueId: item.props.uniqueId ?? sortedIndex,
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
