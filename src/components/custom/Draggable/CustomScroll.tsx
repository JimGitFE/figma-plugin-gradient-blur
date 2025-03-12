// Dependencies
import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react"
// Components
import { useEventListener } from "@/hooks/useEventListener"
import { clamp } from "@/utils"
import useDrag from "@/hooks/useDrag"
// Internal
import styles from "./scrollbar.module.scss"

type FwdRef = React.RefObject<HTMLDivElement>

interface Props extends Omit<React.HTMLAttributes<HTMLDivElement>, "onScroll"> {
   /** Includes wrap & track (attach wheel listener) */
   track?: React.HTMLAttributes<HTMLDivElement>
   thumb?: React.HTMLAttributes<HTMLDivElement>
   children?: React.ReactNode
   config?: {
      wheelEvent?: boolean
   }
}

const DEFAULT_CONFIG: Props["config"] = {
   wheelEvent: true,
} as const

/** Wrapper */
function Wrap({ thumb: thumbAtts, track: trackAtts, children, config: configProp = {}, ...atts }: Props) {
   const config = { ...DEFAULT_CONFIG, ...configProp }
   /* Mutable JSX Scroll objects */

   /** Container */
   const containerRef = useRef<HTMLDivElement>(null)
   /** Scrollable content wrapper */
   const wrapRef = useRef<HTMLDivElement>(null) // defines scroll
   /** Overflowed content */
   const contentRef = useRef<HTMLDivElement>(null) // overflowed content
   /** Thumb Track */
   const trackRef = useRef<HTMLDivElement>(null)

   const [dims, setDims] = useState({ hiddenHeight: 0, trackHeight: 0, thumbHeight: 0 })

   /* Initialize thumb height */

   useLayoutEffect(() => {
      if (!containerRef.current || !contentRef.current) return
      const hiddenHeight = contentRef.current.clientHeight - containerRef.current.clientHeight

      const trackHeight = trackRef.current.clientHeight
      const thumbHeight = trackHeight * (containerRef.current.clientHeight / contentRef.current.clientHeight)

      setDims({ hiddenHeight, trackHeight, thumbHeight })
   }, [containerRef, contentRef])

   const [scrollInstant, setScrollInstant] = useState(false)

   /* Container controlled scroll (top, depends on thumb.y)  */
   const [normalY, setNormalY] = useState(0) // Scroll normal (internal use)
   const [scrolledTop, setScrolledTop] = useState(0)
   const scrolledTopRef = useRef(0) // Controlled scroll motion behaviour

   // Wheel Event
   const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (!containerRef.current.contains(e.target as Node)) return
      scroll((top) => top + e.deltaY / 2, false)
   }

   useEventListener("wheel", onWheel, { element: containerRef, conditional: config.wheelEvent })

   /* Method scroll(current => current + 2) for consumers (of context provider) */

   const scroll = (callback: ((diff: number) => number) | number, instant?: boolean) => {
      if (!contentRef.current || !containerRef.current) return

      const scrollToY = typeof callback === "number" ? callback : callback(scrolledTopRef.current)
      const normal = clamp(scrollToY / dims.hiddenHeight, { min: 0, max: 1 }) // normalised value

      if (scrolledTopRef.current === normal * dims.hiddenHeight) return

      scrolledTopRef.current = normal * dims.hiddenHeight
      setScrollInstant(instant)
      setNormalY(normal)
   }

   /* Thumb grab hook, (clamped dragging position) */

   const { initDrag, thumb } = useThumb({ trackRef, dims, normalY, scroll })

   // Make Wrap element scroll (deps `scrolledTop`) TODO: move to scroll?
   useEffect(() => {
      if (normalY !== clamp(normalY, { min: 0, max: 1 })) console.warn("debug, bad normalY")
      const top = clamp(normalY, { min: 0, max: 1 }) * dims.hiddenHeight
      // Scroll
      wrapRef.current.scrollTo({ top, behavior: (scrollInstant ? "instant" : "smooth") as ScrollBehavior })
      setScrolledTop(top)
   }, [normalY])

   return (
      <ScrollContext.Provider value={{ scrolledY: scrolledTop, scroll, wrapRef, containerRef }}>
         <div {...atts} ref={containerRef} className={`custom-scroll-parent ${styles.container} ${atts.className}`}>
            <div ref={wrapRef} className={`${styles.wrap} pos-relative`}>
               <div ref={contentRef}>{children}</div>
            </div>
            {/* ScrollBar */}
            {thumb.height !== 100 && (
               <div {...trackAtts} className={`${styles.track} ${trackAtts?.className} custom-scroll-track`}>
                  {/* Track */}
                  <div ref={trackRef} className={`${styles["thumb-track"]}`}>
                     {/* Thumb */}
                     <div
                        onMouseDown={initDrag}
                        style={{
                           transform: `translateY(${thumb.y}px)`,
                           height: thumb.height,
                           transitionDuration: scrollInstant && "0ms",
                        }}
                        className={styles.thumb}
                     >
                        {/* User Thumb style */}
                        <div {...thumbAtts} className={`${styles.handle} ${thumbAtts?.className} custom-scroll-thumb`} />
                     </div>
                  </div>
               </div>
            )}
         </div>
      </ScrollContext.Provider>
   )
}

// Context Provider

interface ScrollContextProps {
   /** Current scroll top*/
   scrolledY: number
   wrapRef: FwdRef
   /** Scroll to */
   scroll: (callback: ((scrolledY: number) => number) | number, instant?: boolean) => void
   containerRef: FwdRef
}

const ScrollContext = createContext<ScrollContextProps | undefined>(undefined)

const useScrollCtx = () => {
   const context = useContext(ScrollContext)
   if (!context) {
      throw new Error("useScrollCtx must be used within a ScrollProvider")
   }
   return context
}

// Hook

interface HookProps {
   trackRef: FwdRef
   dims: {
      hiddenHeight: number
      trackHeight: number
      thumbHeight: number
   }
   normalY: number
   scroll: (callback: ((scrolledY: number) => number) | number, instant?: boolean) => void
}

/** Thumb movement: grab drag / click on track, update on scroll */
function useThumb({ trackRef, dims, scroll, normalY }: HookProps) {
   const [posY, setPosY] = useState(0)

   // Convert thumb travelled dy to scrollTop
   const toTopFrom = useCallback(
      (thumbDy: number) => {
         const emptyDy = clamp(thumbDy, { min: 0, max: dims.trackHeight - dims.thumbHeight })
         const normal = emptyDy / (dims.trackHeight - dims.thumbHeight)
         return normal * dims.hiddenHeight
      },
      [dims, posY]
   )

   /* Trigger scrolling (sequentially updates position via `normalY`) */

   const downPosYRef = useRef(0)
   // 1 Thumb grab & Drag
   const { initDrag } = useDrag<"y">({
      callbacks: {
         down: () => (downPosYRef.current = posY),
         move: (_, { dy }) => scroll(toTopFrom(downPosYRef.current + dy), true),
         up: (_, { dy }) => scroll(toTopFrom(downPosYRef.current + dy), true),
      },
   })

   // 2 Empty Track Click
   const onTrackClick = (e: MouseEvent) => {
      if (!trackRef.current || e.target !== trackRef.current) return
      console.log(e.target)
      /* Place thumb at center of event */
      const { top } = trackRef.current.getBoundingClientRect()
      scroll(toTopFrom(e.clientY - top - dims.thumbHeight / 2), false)
   }

   useEventListener("mousedown", onTrackClick, { element: trackRef.current })

   /* Controlled thumb position (deps on scrolled)  */

   useEffect(() => setPosY(normalY * (dims.trackHeight - dims.thumbHeight)), [normalY])

   return { initDrag, thumb: { height: dims.thumbHeight, y: posY } }
}

const Scroll = { Wrap, useScrollCtx } // namespace
export { Wrap, useScrollCtx }
export default Scroll
