// Dependencies
import React, { useRef, useState, createContext, useEffect } from "react"
// Internal
import useDrag from "@/hooks/useDrag"
import { type SourceProps, Item } from "./Item"
import { reorder } from "./utils"
import { useResizeObserver } from "@/hooks/useResizeObserver"
import Scroll from "./CustomScroll"

const DEFAULT_CONFIG: Required<ManagerProps<any>["config"]> = {
   dist: 30,
   multiplier: 1.5,
}

/** extends CustomScroll config */
interface ManagerProps<T extends SourceProps> extends Partial<React.ComponentProps<typeof Scroll.Wrap>> {
   children: Component<typeof Item>[]
   sources: T[]
   /** reordered data source */
   onReorder: (dataSources: T[]) => void
   /** Scroll config */
   config?: {
      /** Start scrolling when dragging at `dist` from boundary */
      dist?: number
      /** Multiplier closer to edge */
      multiplier?: number
   }
}

/** Drag Reorder & Provider */
function Manager<T extends SourceProps>({ children, sources, onReorder, config: configProp = {} }: ManagerProps<T>) {
   const config = { ...DEFAULT_CONFIG, ...configProp }
   // Items Dimension
   const itemRefs = useRef([]) // sorted by index

   const { scrolledY, scroll, setScrollInstant, containerRef } = Scroll.useScrollCtx() // (attach observer)

   /*
    * Item lifecycle
    * - `0` Standard document flow - Compute bounding rect
    * - `1` Explicitly positioned - Moves to index position
    * - `2` Floating - Enables Transition
    */
   // prettier-ignore
   const [lifecycle, setLifecycle] = useState<(0 | 1 | 2)>(0)

   // prettier-ignore
   /* Resize Observer - calc hover slots relative positions */
   useResizeObserver({ref: containerRef, callback: () => {setLifecycle(0), requestAnimationFrame(() => {recalculateItemRects(), setLifecycle(1), requestAnimationFrame(() => setLifecycle(2))})}})

   // Draggables
   const [active, setActive] = useState({ uniqueId: -1, index: -1, dy: null })
   const [hovering, setHovering] = useState({ uniqueId: -1, index: -1 }) // hovering slot index

   /** Reorderable Items State - Handles dragging active item, hovering over item, dragStart callback, & traveled drag distance */
   const { drag, initDrag, isDragging } = useDrag({
      callbacks: {
         move: (_, { dy }) => {
            setActive((act) => ({ ...act, dy }))
            // handle scroll
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

   /** Hovering slot index, accomodates dragged item (always represents an index of item[]) */
   useEffect(() => {
      if (!itemRefs.current || active.index === -1) return
      // Account for scroll and drag distance
      const mouseY = scrolledY + drag.downPos.y + active.dy
      // Index of the item currently being hovered
      let index = itemRefs.current.findIndex((ref) => ref?.rect && mouseY >= ref.rect.top && mouseY <= ref.rect.bottom)
      // Fallback to closest slot
      if (index === -1) index = itemRefs.current[indexFromId(1)]?.rect.top >= mouseY ? 0 : itemRefs.current.length - 1

      setHovering({ uniqueId: sources[index].uniqueId, index })
   }, [active, scrolledY])

   /* Scroll Hndlers */

   // When dragging item is near the edges of the container
   const scrollOnEdges = (posY: number) => {
      if (!containerRef.current) return
      const ctn = containerRef.current.getBoundingClientRect()
      // Scroll top and scroll bottom
      const [scTop, scBtm] = [ctn.top + config.dist, ctn.bottom - config.dist]

      if (posY < scTop) {
         setScrollInstant(isDragging)
         const strength = config.multiplier * (posY - scTop)
         scroll((total) => total + strength / 400) // normalizer
      } else if (posY > scBtm) {
         setScrollInstant(isDragging)
         const strength = config.multiplier * (posY - scBtm)
         scroll((total) => total + strength / 400) // normalizer
      }
   }

   useEffect(() => {
      if (active.index === -1 && typeof drag.clientPos.y !== "number") return
      scrollOnEdges(drag.clientPos.y)
      return () => setScrollInstant(false)
   }, [active, scrolledY])

   // Utils
   const recalculateItemRects = () => itemRefs.current.forEach((ref) => ref.node && (ref.rect = ref.node.getBoundingClientRect()))
   const indexFromId = (uniqueId: number) => sources.findIndex((it) => it.uniqueId === uniqueId)

   return (
      <>
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
      </>
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
   if (!context) throw new Error("Item must be used within a Reorder.Manager")
   // type Return = [(typeof context)["item"], (typeof context)["state"], (typeof context)["internal"]]
   // return [{ ...context.item }, { ...context.state }, { ...context.internal }] as Return
   return context
}

// Makes Scroll provider available to Manager
function Container<T extends SourceProps>({ sources, onReorder, children, ...atts }: ManagerProps<T>) {
   return (
      <Scroll.Wrap {...atts} className={`${atts.className} pos-relative`}>
         <Manager sources={sources} onReorder={onReorder}>
            {children}
         </Manager>
      </Scroll.Wrap>
   )
}

export { Container, ReorderContext, useReorder }
