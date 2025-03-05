// Dependencies
import React, { useRef, useState, createContext, HTMLAttributes, ReactElement } from "react"
// Internal
import useDrag from "@/hooks/useDrag"
import { type ItemProps, Item } from "./Item"
import { reorder } from "./utils"

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

   // Draggables
   const [active, setActive] = useState({ uniqueId: -1, index: -1 })
   const [hovering, setHovering] = useState({ uniqueId: -1, index: -1 }) // hovering slot index

   const onDragStart = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, uniqueId: number) => {
      recalculateItemRects()
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

   // Mouse
   const { dy, onDragStart: dragStartCallback } = useDrag({ axis: "y", callbacks: { move, up } })

   const recalculateItemRects = () => {
      itemRefs.current.forEach((ref, i) => ref.node && (itemRefs.current[i].rect = ref.node.getBoundingClientRect()))
   }

   /** Placeholder that should activate to accomodate dragged item (always represents an index of item[]) */
   const hoveringItemId = (e: MouseEvent) => {
      /** Index of the item currently being hovered */
      const index = itemRefs.current.findIndex((ref) => ref.rect && e.clientY >= ref.rect.top && e.clientY <= ref.rect.bottom)
      if (index === -1) return itemRefs.current[indexFromId(0)].rect.top >= e.clientY ? 0 : itemRefs.current.length - 1
      return children[index].props.uniqueId
   }

   // Util
   const indexFromId = (uniqueId: number) => children.findIndex((it) => it.props.uniqueId === uniqueId)

   return (
      <div {...atts} className="pos-relative">
         {children.map((item, index) => (
            <ReorderContext.Provider
               key={item.props.uniqueId ?? index}
               // Context
               value={{
                  item: {
                     /** Handles display order */
                     index: children.findIndex((it) => it.props.uniqueId === item.props.uniqueId),
                     /** state key control */
                     uniqueId: item.props.uniqueId ?? index,
                     /** drag handle Init */
                     onDragStart,
                     isActive: active.uniqueId === item.props.uniqueId,
                  },
                  state: {
                     hovering,
                     active,
                     activeDy: dy,
                  },
                  itemRefs,
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
      hovering: ItemRepresentation
      active: ItemRepresentation
      /** travelled Y distance for active item */
      activeDy: number
   }
   itemRefs: React.MutableRefObject<{ rect: DOMRect; node: HTMLDivElement }[]>
}

/** Reorder Internal Context */
const ReorderContext = createContext<ReorderContextProps | undefined>(undefined)

export { Container, ReorderContext }
