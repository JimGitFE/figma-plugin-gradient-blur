// Dependencies
import React, { useRef, useState, createContext, useEffect, useMemo, useLayoutEffect, Children, act } from "react"
// Internal
import useDrag from "@/hooks/useDrag"
import { type SourceProps, Item } from "./Item"
import { difference, reorder } from "./utils"
import { useResizeObserver } from "@/hooks/useResizeObserver"
import Scroll from "./CustomScroll"
import { useEventListener } from "@/hooks/useEventListener"
import useAnimation from "@/hooks/useAnimation"
import { clamp } from "@/utils"

/** extends CustomScroll config */
interface ManagerProps<T extends SourceProps> extends Partial<Omit<React.ComponentProps<typeof Scroll.Wrap>, "config">> {
   children: Component<typeof Item>[]
   sources: T[]
   /** reordered data source (callback) + dropped Item (unique Id, previous index and new index) */
   onReorder: (
      dataSources: T[],
      dropped: {
         uniqueId: number
         prevIndex: number
         index: number
      }
   ) => void
   /** Scroll on edge config */
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

/** Drag Reorder & Provider */ // TODO: TSDoc component
function Manager<T extends SourceProps>({ children, sources, onReorder, config: configProp = {} }: ManagerProps<T>) {
   const config = { ...DEFAULT_CONFIG, ...configProp }
   /** Sorted by index thus updates on reorder events */
   const itemsRef = useRef([]) // Items Dimension (sorted by index)
   /** Sorted by index thus updates on reorder events (when item uId 2 at 0 slot with uId 1 is at slotsRef[0]) */
   const slotsRef = useRef([]) // Items Dimension (sorted by index)
   /** Slots Rects (sorted by index) */ // will trigger rerender on each item setting rect
   const [slotRects, setSlotRects] = useState<DOMRect[]>([])

   /* 0 Restructure itemsRef on sources change (removed or new item) */

   // const prevSourcesRef = useRef(sources) // Previous sources (sorted by uniqueId)
   useEffect(() => {
      // console.log("new sources ", sources)
      // if (didSourcesChange(sources)) itemsRef.current = [] // update itemsRef
      // prevSourcesRef.current = sources
      // requestAnimationFrame(() => recalculateItemsRect())
      // recalculateItemsRect()
      console.log("recalculateItemsRect slots mea™sure", slotsRef.current)
      // recalculateSlotsRect()
   }, [sources, itemsRef.current])

   /* 0 Scroll Managing State */

   const { scroll, scrolledY, containerRef } = Scroll.useScrollCtx() // (attach observer)
   const activeInitScrolledYRef = useRef(0) // Item offsets scroll

   /* Item lifecycle */

   // prettier-ignore
   // - `0` Standard document flow - Compute bounding rect
   // - `1` Explicitly positioned - Moves to index position
   // - `2` Floating - Enables Transition
   // const [lifecycle, setLifecycle] = useState<(0 | 1 | 2)>(2)

   // prettier-ignore
   // Resize Observer - calc hover slots relative positions
   // useResizeObserver({ref: containerRef, callback: () => {setLifecycle(0), requestAnimationFrame(() => {recalculateItemsRect(), setLifecycle(1), requestAnimationFrame(() => setLifecycle(2))})}})

   /* 1 Reorderable Items Manager */

   type Item = { uniqueId: number; index: number; dy: number; scrolledY: number } & { rect?: DOMRect; node?: HTMLDivElement }
   const [active, setActive] = useState<Item>({ uniqueId: -1, index: -1, dy: null, scrolledY: null })
   const [hovering, setHovering] = useState({ uniqueId: -1, index: -1 }) // hovering slot index

   // Active grab, Hovering, initDrag, traveled dy
   const { drag, initDrag, isDragging } = useDrag({
      callbacks: {
         move: (_, { dy }) => {
            setActive((act) => ({ ...act, dy }))
         },
         up: () => {
            const droppedItem = { uniqueId: active.uniqueId, prevIndex: active.index, index: hovering.index }
            if (active.index !== hovering.index) onReorder(reorder(sources, active.index, hovering.index), droppedItem)
            setActive({ uniqueId: -1, index: -1, dy: null, scrolledY: null })
            setHovering({ uniqueId: -1, index: -1 })
            activeInitScrolledYRef.current = 0
         },
      },
   })
   const onDragStart = (e: EventFor<MouseEvent>, uniqueId: number) => {
      activeInitScrolledYRef.current = scrolledY
      setActive({ uniqueId, index: indexFromId(uniqueId), dy: 0, scrolledY: 0, ...itemsRef.current[indexFromId(uniqueId)] })
      setHovering({ uniqueId, index: indexFromId(uniqueId) })
      initDrag(e)
   }

   /* 0 Custom wheel event */

   /** Avoid scroll on `scrollOnEdges` areas when dragging */
   const onCustomWheel = (e: WheelEvent) => {
      if (!containerRef.current.contains(e.target as Node)) return
      scroll((top) => top + e.deltaY / 2, false)
   }

   useEventListener("wheel", onCustomWheel, { conditional: !isDragging, element: containerRef })

   /* 2 Hovering slot index */ // TODO: refactor

   // Accomodates dragged item (always represents an index of item[])
   useEffect(() => {
      if (!slotsRef.current || active.index === -1) return
      // Account for scroll and drag distance
      const mouseY = scrolledY + drag.down.y + active.dy

      // recalculateSlotsRect() // fix: rect relative to scrolled container (new items when scrolled have offseted rect, relative to rest)
      let index = slotRects.findIndex((rect) => rect && mouseY >= rect.top && mouseY <= rect.bottom)

      // Fallback to closest slot
      if (index === -1) index = slotRects[0]?.top >= mouseY ? 0 : slotRects.length - 1

      if (hovering.index === index) return // object/array is a new reference in memory

      setHovering({ uniqueId: sources[index].uniqueId, index })
   }, [active, scrolledY, sources, slotRects, lifecycle])

   /* 3 Auto Scroll on bounds when dragging */

   /** Define auto-scroll areas (offseted by config.dist from container bound) */
   const [scTop, scBtm] = useMemo(() => {
      if (!containerRef.current) return []
      const ctn = containerRef.current.getBoundingClientRect()
      // Scroll top and scroll bottom
      return [ctn.top + config.dist, ctn.bottom - config.dist]
   }, [containerRef, config])

   /** On item drag, scroll when near the edges */
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

   // useEffect(() => {
   //    const selectedId: number = 2
   //    if (selectedId === -1 || !itemsRef.current || !containerRef.current) return
   //    const selectedTop = itemsRef.current[indexFromId(selectedId)]?.rect?.top

   //    const { top, height } = containerRef.current.getBoundingClientRect()

   //    if (selectedTop < top || selectedTop > top + height) {
   //       scroll((scTop) => scTop + selectedTop - top, true)
   //    }
   // }, [sources])

   /* Utils */

   const recalculateItemsRect = () => itemsRef.current.forEach((ref) => ref.node && (ref.rect = ref.node.getBoundingClientRect()))
   const recalculateSlotsRect = () => slotsRef.current.forEach((ref) => ref.node && (ref.rect = ref.node.getBoundingClientRect()))

   // if (active.index === -1 ) recalculateItemsRect()
   const indexFromId = (uniqueId: number) => sources.findIndex((it) => it.uniqueId === uniqueId)
   // const didSourcesChange = (sources: T[]) =>
   //    [
   //       ...difference(
   //          sources.map((it) => it.uniqueId),
   //          prevSourcesRef.current.map((prev) => prev.uniqueId)
   //       ),
   //       ...difference(
   //          prevSourcesRef.current.map((prev) => prev.uniqueId),
   //          sources.map((it) => it.uniqueId)
   //       ),
   //    ].length > 0

   // Scroll contianer
   return [...children]
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
                  /** Item position (Handles display order) */
                  index: indexFromId(item.props.uniqueId),
                  /** Slot representation (state key control) */
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
                  sources,
               },
               /* Internal */
               {
                  itemsRef,
                  slotsRef,
                  slotRects,
                  setSlotRects,
                  scrolledY,
               },
            ]}
            /* Children */
            children={item}
         />
      ))
}

type ItemRef = React.MutableRefObject<{ rect: DOMRect; node: HTMLDivElement; index?: number }[]>

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
      active: { uniqueId: number; index: number; dy: number; scrolledY: number } & { rect?: DOMRect; node?: HTMLDivElement }
      /** hovering slot index */
      hovering: { uniqueId: number; index: number }
      sources: SourceProps[]
   },
   /** Internal */
   {
      itemsRef: ItemRef
      // slotsRef: React.MutableRefObject<HTMLDivElement[]>
      slotsRef: ItemRef
      slotRects: DOMRect[]
      setSlotRects: React.Dispatch<React.SetStateAction<DOMRect[]>>
      /**  0: idle, 1: drag start, 2: moved */
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
