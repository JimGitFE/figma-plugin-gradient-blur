// Dependencies
import React, { useRef, useState, createContext, HTMLAttributes } from "react"
// Internal
import useDrag from "@/hooks/useDrag"
import { type SourceProps, Item } from "./Item"
import { reorder } from "./utils"
import { useResizeObserver } from "@/hooks/useResizeObserver"
import { ScrollBar } from "./ScrollBar"
import styles from "./scrollbar.module.scss"

interface ContainerProps<T extends SourceProps> extends HTMLAttributes<HTMLDivElement> {
   children: Component<typeof Item>[]
   sources: T[]
   /** reordered data source */
   onReorder: (dataSources: T[]) => void
   /** scrollbar config */
   scrollbar?: Partial<React.ComponentProps<typeof ScrollBar>>
}

/** Drag Reorder & Provider */
function Container<T extends SourceProps>({ scrollbar = {}, children, sources, onReorder, ...atts }: ContainerProps<T>) {
   // Items Dimension
   const itemRefs = useRef([]) // sorted by index

   /*
    * Item lifecycle
    * - `0` Standard document flow - Compute bounding rect
    * - `1` Explicitly positioned - Moves to index position
    * - `2` Floating - Enables Transition
    */
   // prettier-ignore
   const [lifecycle, setLifecycle] = useState<(0 | 1 | 2)>(0)

   // Container (attach observer)
   const ref = useRef<HTMLDivElement>(null)
   // prettier-ignore
   /* Resize Observer - calc hover slots relative positions */
   useResizeObserver({ref, callback: () => {setLifecycle(0), requestAnimationFrame(() => {recalculateItemRects(), setLifecycle(1), requestAnimationFrame(() => setLifecycle(2))})}})

   // Draggables
   const [active, setActive] = useState({ uniqueId: -1, index: -1, dy: null })
   const [hovering, setHovering] = useState({ uniqueId: -1, index: -1 }) // hovering slot index

   /** Reorderable Items State - Handles dragging active item, hovering over item, dragStart callback, & traveled drag distance */
   const { initDrag } = useDrag({
      callbacks: {
         move: (e, { dy }) => {
            const uniqueId = hoveringItemId(e)
            setActive((act) => ({ ...act, dy }))
            setHovering({ uniqueId, index: indexFromId(uniqueId) })
         },
         up: () => {
            onReorder(reorder(sources, active.index, hovering.index))
            setActive({ uniqueId: -1, index: -1, dy: null })
            setHovering({ uniqueId: -1, index: -1 })
         },
      },
   })
   const onDragStart = (e: EventFor<MouseEvent>, uniqueId: number) => {
      setActive({ uniqueId, index: indexFromId(uniqueId), dy: 0 })
      setHovering({ uniqueId, index: indexFromId(uniqueId) })
      initDrag(e)
   }

   /** Placeholder that should activate to accomodate dragged item (always represents an index of item[]) */
   const hoveringItemId = (e: EventFor<MouseEvent>) => {
      /** Index of the item currently being hovered */
      let index = itemRefs.current.findIndex((ref) => ref?.rect && e.clientY >= ref.rect.top && e.clientY <= ref.rect.bottom)
      if (index === -1) index = itemRefs.current[indexFromId(1)]?.rect.top >= e.clientY ? 0 : itemRefs.current.length - 1
      return sources[index].uniqueId
   }

   // Utils
   const recalculateItemRects = () => {
      itemRefs.current.forEach((ref, i) => ref.node && (itemRefs.current[i].rect = ref.node.getBoundingClientRect()))
   }
   const indexFromId = (uniqueId: number) => sources.findIndex((it) => it.uniqueId === uniqueId)

   return (
      // <div {...atts} ref={ref} className={`${styles.reorderables} pos-relative scrollable-parent`}>
      <ScrollBar ref={ref} track={{ className: "track" }} thumb={{ className: "thumb" }} className="pos-relative scrollable-parent">
         {/* Scroll contianer */}
         {[...children]
            .filter((child) => child.type === Item)
            .sort((a, b) => a.props.uniqueId - b.props.uniqueId)
            .map((item, sortedIndex) => (
               <ReorderContext.Provider
                  /* If uniqueId sequential then sortedIndex === uniqueId - 1 */
                  key={item.props.uniqueId ?? sortedIndex}
                  /* Context */
                  value={[
                     /* Item */
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
                     /* State */
                     {
                        hovering,
                        active,
                     },
                     /* Internal */
                     {
                        itemRefs,
                        recalculateRects: recalculateItemRects,
                        lifecycle,
                     },
                  ]}
                  /* Children */
                  children={item}
               />
            ))}
      </ScrollBar>
   )
}

type ItemRef = React.MutableRefObject<{ rect: DOMRect; node: HTMLDivElement }[]>

type ReorderContextProps = [
   /** Item */
   {
      index: number
      uniqueId: number
      rect: DOMRect
      /** Item being dragged */
      isActive: boolean
      onDragStart: (e: EventFor<MouseEvent>, uniqueId: number) => void
   },
   /** State */
   {
      active: { uniqueId: number; index: number; dy: number }
      /** hovering slot index */
      hovering: { uniqueId: number; index: number }
   },
   /** Internal */
   {
      itemRefs: ItemRef
      recalculateRects: () => void
      /**  0: idle, 1: drag start, 2: moved */
      lifecycle: number
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
