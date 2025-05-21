// Dependencies
import React, { useRef, useState, createContext, useEffect, useMemo, useLayoutEffect, Children } from "react"
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

/** Drag Reorder & Provider */
function Manager<T extends SourceProps>({ children, sources, onReorder, config: configProp = {} }: ManagerProps<T>) {
   const config = { ...DEFAULT_CONFIG, ...configProp }
   /** Sorted by index thus updates on reorder events */
   const itemsRef = useRef([]) // Items Dimension (sorted by index)
   const [itemsRect, setItemsRect] = useState([]) // Items Dimension (sorted by index)

   /* Scroll Managing State */

   // const { scroll, scrolledY, containerRef } = Scroll.useScrollCtx() // (attach observer)
   const tempContainerRef = useRef<HTMLDivElement>(null) // (attach observer)
   const activeInitScrolledYRef = useRef(0) // unused?

   /* Item lifecycle */

   // prettier-ignore
   // - `0` Standard document flow - Compute bounding rect
   // - `1` Explicitly positioned - Moves to index position
   // - `2` Floating - Enables Transition
   // const [lifecycle, setLifecycle] = useState<(0 | 1 | 2)>(2)
   const [lifecycle, setLifecycle] = useState<number>(2)

   // prettier-ignore
   // Resize Observer - calc hover slots relative positions
   // useResizeObserver({ref: tempContainerRef, callback: () => {setLifecycle(0), requestAnimationFrame(() => {recalculateItemsRect(), setLifecycle(1), requestAnimationFrame(() => setLifecycle(2))})}})
   // useResizeObserver({ref: tempContainerRef, callback: () => {
   //    setLifecycle(0)
   //    // recalculateItemsRect()
   //    requestAnimationFrame(() => {setLifecycle(1), setLifecycle(2)})
   //    // setLifecycle(2)
   // }})

   useLayoutEffect(() => {
      // setLifecycle(0)
      // recalculateItemsRect() // use state? for rects?x
      // console.log("items recalculated, now lifecycle 2")
      // requestAnimationFrame(() => {
         // setLifecycle(2)
      // })
      console.log("children update", itemsRef.current)
   }, [children, itemsRef.current])

   /* Reorderable Items Manager */

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
      // activeInitScrolledYRef.current = scrolledY
      setActive({ uniqueId, index: indexFromId(uniqueId), dy: 0, scrolledY: 0, ...itemsRef.current[indexFromId(uniqueId)] })
      setHovering({ uniqueId, index: indexFromId(uniqueId) })
      initDrag(e)
   }

   /* Custom wheel event */

   // // Avoid scroll on `scrollOnEdges` areas when dragging
   // const onCustomWheel = (e: WheelEvent) => {
   //    if (!containerRef.current.contains(e.target as Node)) return
   //    scroll((top) => top + e.deltaY / 2, false)
   // }

   useEffect(() => {
      console.log(itemsRef.current)
   }, [sources, lifecycle])
   useEffect(() => {
      console.warn("itemsRef.current")
      // ()
      // // safe recalc rects
      // setLifecycle(0),
      //    requestAnimationFrame(() => {
      //       recalculateItemsRect(), setLifecycle(1), requestAnimationFrame(() => setLifecycle(2))
      //    })
      // recalculateItemsRect()
   }, [sources])

   // useEventListener("wheel", onCustomWheel, { conditional: !isDragging, element: containerRef })

   /* Hovering slot index */

   // Accomodates dragged item (always represents an index of item[])
   useEffect(() => {
      if (!itemsRef.current || active.index === -1) return
      // Account for scroll and drag distance
      const mouseY = 0 + drag.downPos.y + active.dy
      // const mouseY = scrolledY + drag.downPos.y + active.dy
      // Index of the item currently being hovered
      /* IMPORTANT! */
      // BUT: represents old slots
      /* IMPORTANT! */
      // let index = itemsRef.current.findIndex((ref) => ref?.rect && mouseY >= ref.rect.top && mouseY <= ref.rect.bottom)
      let index = -1
      itemsRef.current.forEach((_, i) => {
         const top = tempContainerRef.current.getBoundingClientRect().top
         if (0 + 32 * i <= mouseY - top && mouseY - top <= 32 * (i + 1)) {
            index = i
         }
      })
      // 0 < mouseY < 32
      // Fallback to closest slot
      if (index === -1) index = itemsRef.current[0]?.rect.top >= mouseY ? 0 : itemsRef.current.length - 1

      if (hovering.index === index) return // object/array is a new reference in memory

      console.log("hovering index is ", index)
      setHovering({ uniqueId: sources[index].uniqueId, index })
      console.log("Hovering ", sources[index].uniqueId, " at ", index)
      // }, [active, scrolledY])
   }, [active, sources])

   /* Auto Scroll on bounds when dragging */

   // // Auto scroll on item drag area
   // const [scTop, scBtm] = useMemo(() => {
   //    if (!containerRef.current) return []
   //    const ctn = containerRef.current.getBoundingClientRect()
   //    // Scroll top and scroll bottom
   //    return [ctn.top + config.dist, ctn.bottom - config.dist]
   // }, [containerRef, config])

   // // On item drag, scroll when near the edges
   // const onEdgeAutoScroll = (deltaTime: number) => {
   //    if (typeof drag.clientPos.y !== "number") return

   //    scroll((top) => {
   //       const scBound = drag.clientPos.y < scTop ? scTop : scBtm
   //       const strength = config.multiplier * (drag.clientPos.y - scBound)
   //       const newTop = top + strength / (clamp(deltaTime, { min: 1000 / 60 }) * 5)

   //       setActive((prev) => ({ ...prev, scrolledY: newTop - activeInitScrolledYRef.current }))
   //       return newTop
   //    }, isDragging)
   // }

   // // When dragging item is near the edges of the container
   // useAnimation(onEdgeAutoScroll, [active.dy], {
   //    conditional: (drag.clientPos.y < scTop || drag.clientPos.y > scBtm) && active.index !== -1,
   // })

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

   // @deprecate, use at node setter (Item ref cb)
   // // Precaution: should compute rect position on lifecycle 0, meaning no floating items
   // const recalculateItemsRect = () => {
   //    itemsRef.current.forEach((ref) => ref.node && (ref.rect = ref.node.getBoundingClientRect()))
   //    setItemsRect(itemsRef.current.map((ref) => ref.rect))
   // }
   const indexFromId = (uniqueId: number) => sources.findIndex((it) => it.uniqueId === uniqueId)

   // Scroll contianer
   return (
      <div ref={tempContainerRef}>
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
                        // rect: itemsRect[indexFromId(item.props.uniqueId)],
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
                        itemsRect,
                        // recalculateRects: recalculateItemsRect,
                        lifecycle,
                        // scrolledY,
                     },
                  ]}
                  /* Children */
                  children={item}
               />
            ))}
      </div>
   )
}

type ItemRef = React.MutableRefObject<{ rect: DOMRect; node: HTMLDivElement }[]>
// type ItemRef = React.MutableRefObject<HTMLDivElement[]>

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
   },
   /** Internal */
   {
      itemsRef: ItemRef
      itemsRect: DOMRect[]
      // recalculateRects: () => void
      /**  0: idle, 1: drag start, 2: moved */
      lifecycle: number
      // scrolledY: number
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
      <div className="pos-relative">
         {/* <Scroll.Wrap {...atts} config={{ wheelEvent: false }} className={`${atts.className} pos-relative`}> */}

         <Manager sources={sources} onReorder={onReorder}>
            {children}
         </Manager>
         {/* </Scroll.Wrap> */}
      </div>
   )
}

export { Container, ReorderContext, useReorder }
