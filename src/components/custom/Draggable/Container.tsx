// Dependencies
import React, { useRef, useState, createContext, useEffect, useMemo } from "react"
// Internal
import useDrag from "@/hooks/useDrag"
import { type SourceProps, Item } from "./Item"
import { reorder } from "./utils"
import { useResizeObserver } from "@/hooks/useResizeObserver"
import Scroll from "./CustomScroll"
import { useEventListener } from "@/hooks/useEventListener"
import useAnimation from "@/hooks/useAnimation"
import { clamp } from "@/utils"

/** extends CustomScroll config */
interface ManagerProps<T extends SourceProps> extends Partial<Omit<React.ComponentProps<typeof Scroll.Wrap>, "config">> {
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

const DEFAULT_CONFIG: Required<ManagerProps<any>["config"]> = {
   dist: 30,
   multiplier: 4,
}

/** Drag Reorder & Provider */
function Manager<T extends SourceProps>({ children, sources, onReorder, config: configProp = {} }: ManagerProps<T>) {
   const config = { ...DEFAULT_CONFIG, ...configProp }
   const itemsRef = useRef([]) // Items Dimension (sorted by index)

   /* Scroll Managing State */

   const { scroll, scrolledY, containerRef } = Scroll.useScrollCtx() // (attach observer)
   const activeInitScrolledYRef = useRef(0) // unused?

   /* Item lifecycle */

   // prettier-ignore
   // - `0` Standard document flow - Compute bounding rect
   // - `1` Explicitly positioned - Moves to index position
   // - `2` Floating - Enables Transition
   const [lifecycle, setLifecycle] = useState<(0 | 1 | 2)>(0)

   // prettier-ignore
   // Resize Observer - calc hover slots relative positions
   useResizeObserver({ref: containerRef, callback: () => {setLifecycle(0), requestAnimationFrame(() => {recalculateItemsRect(), setLifecycle(1), requestAnimationFrame(() => setLifecycle(2))})}})

   /* Reorderable Items Manager */

   const [active, setActive] = useState({ uniqueId: -1, index: -1, dy: null, scrolledY: null })
   const [hovering, setHovering] = useState({ uniqueId: -1, index: -1 }) // hovering slot index

   // Active grab, Hovering, initDrag, traveled dy
   const { drag, initDrag, isDragging } = useDrag({
      callbacks: {
         move: (_, { dy }) => {
            setActive((act) => ({ ...act, dy }))
         },
         up: () => {
            onReorder(reorder(sources, active.index, hovering.index))
            setActive({ uniqueId: -1, index: -1, dy: null, scrolledY: null })
            setHovering({ uniqueId: -1, index: -1 })
            activeInitScrolledYRef.current = 0
         },
      },
   })
   const onDragStart = (e: EventFor<MouseEvent>, uniqueId: number) => {
      activeInitScrolledYRef.current = scrolledY
      setActive({ uniqueId, index: indexFromId(uniqueId), dy: 0, scrolledY: 0 })
      setHovering({ uniqueId, index: indexFromId(uniqueId) })
      initDrag(e)
   }

   /* Custom wheel event */

   // Avoid scroll on `scrollOnEdges` areas when dragging
   const onCustomWheel = (e: WheelEvent) => {
      if (!containerRef.current.contains(e.target as Node)) return
      scroll((top) => top + e.deltaY / 2, false)
   }

   useEventListener("wheel", onCustomWheel, { conditional: !isDragging, element: containerRef })

   /* Hovering slot index */

   // Accomodates dragged item (always represents an index of item[])
   useEffect(() => {
      if (!itemsRef.current || active.index === -1) return
      // Account for scroll and drag distance
      const mouseY = scrolledY + drag.downPos.y + active.dy
      // Index of the item currently being hovered
      let index = itemsRef.current.findIndex((ref) => ref?.rect && mouseY >= ref.rect.top && mouseY <= ref.rect.bottom)
      // Fallback to closest slot
      if (index === -1) index = itemsRef.current[indexFromId(1)]?.rect.top >= mouseY ? 0 : itemsRef.current.length - 1

      if (hovering.index === index) return // object/array is a new reference in memory

      setHovering({ uniqueId: sources[index].uniqueId, index })
   }, [active, scrolledY])

   /* Auto Scroll on bounds when dragging */

   // Auto scroll on item drag area
   const [scTop, scBtm] = useMemo(() => {
      if (!containerRef.current) return []
      const ctn = containerRef.current.getBoundingClientRect()
      // Scroll top and scroll bottom
      return [ctn.top + config.dist, ctn.bottom - config.dist]
   }, [containerRef, config])

   // On item drag, scroll when near the edges
   const onEdgeAutoScroll = (deltaTime: number) => {
      if (typeof drag.clientPos.y !== "number") return

      scroll((top) => {
         const scBound = drag.clientPos.y < scTop ? scTop : scBtm
         const strength = config.multiplier * (drag.clientPos.y - scBound)
         const newTop = top + strength / (clamp(deltaTime, { min: 1000 / 60 }) * 5)

         setActive((prev) => ({ ...prev, scrolledY: newTop - activeInitScrolledYRef.current }))
         return newTop
      }, isDragging)
   }

   // When dragging item is near the edges of the container
   useAnimation(onEdgeAutoScroll, [active.dy], {
      conditional: (drag.clientPos.y < scTop || drag.clientPos.y > scBtm) && active.index !== -1,
   })

   /* Follow selected (out of screen on reorder) */

   useEffect(() => {
      const selectedId: number = 2
      if (selectedId === -1 || !itemsRef.current || !containerRef.current) return
      const selectedTop = itemsRef.current[indexFromId(selectedId)]?.rect?.top

      const { top, height } = containerRef.current.getBoundingClientRect()

      if (selectedTop < top || selectedTop > top + height) {
         scroll((scTop) => scTop + selectedTop - top, true)
      }
   }, [sources])

   /* Utils */

   const recalculateItemsRect = () => itemsRef.current.forEach((ref) => ref.node && (ref.rect = ref.node.getBoundingClientRect()))
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
                        rect: itemsRef.current[indexFromId(item.props.uniqueId)]?.rect,
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
                        itemsRef,
                        recalculateRects: recalculateItemsRect,
                        lifecycle,
                        scrolledY,
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
      active: { uniqueId: number; index: number; dy: number; scrolledY: number }
      /** hovering slot index */
      hovering: { uniqueId: number; index: number }
   },
   /** Internal */
   {
      itemsRef: ItemRef
      recalculateRects: () => void
      /**  0: idle, 1: drag start, 2: moved */
      lifecycle: number
      scrolledY: number
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
function Container<T extends SourceProps>({ sources, onReorder, children, ...atts }: Omit<ManagerProps<T>, "config">) {
   return (
      <Scroll.Wrap {...atts} config={{ wheelEvent: false }} className={`${atts.className} pos-relative`}>
         <Manager sources={sources} onReorder={onReorder}>
            {children}
         </Manager>
      </Scroll.Wrap>
   )
}

export { Container, ReorderContext, useReorder }
