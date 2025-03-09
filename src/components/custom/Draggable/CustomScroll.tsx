// Dependencies
import React, { createContext, forwardRef, useContext, useEffect, useLayoutEffect, useRef, useState } from "react"
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
   onScroll?: (dy: number) => void
   children?: React.ReactNode
}

/** Wrapper */
const CustomScroll = forwardRef<HTMLDivElement, Props>(
   ({ thumb: thumbAtts, track: trackAtts, onScroll, children, ...atts }, fwdRef: FwdRef) => {
      /* Mutable JSX Scroll objects */

      /** Container */
      const intContainerRef = useRef<HTMLDivElement>(null)
      const containerRef = fwdRef || intContainerRef
      /** Scrollable content wrapper */
      const wrapRef = useRef<HTMLDivElement>(null) // defines scroll
      /** Overflowed content */
      const contentRef = useRef<HTMLDivElement>(null) // overflowed content
      /** Scroll Track */
      const trackRef = useRef<HTMLDivElement>(null)

      /* Scoll Hook (thumb clamped dragging position) */

      const { thumb, isDragging, initDrag } = useScrollThumb({ containerRef, contentRef, trackRef })

      /* Container controlled scroll (top, depends on thumb.y)  */

      const [scrolledTop, setScrolledTop] = useState(0)
      // Convert thumb % movement to container % should move
      useEffect(() => {
         if (!contentRef.current || !containerRef.current) return
         // thumb y movement relative to track empty space
         const thumbNormal = containerRef.current.clientHeight / contentRef.current.clientHeight
         const trackEmptySpace = trackRef.current.clientHeight * (1 - thumbNormal)
         //
         const hiddenHeight = contentRef.current.clientHeight - containerRef.current.clientHeight
         const normal = clamp(thumb.y / trackEmptySpace, { min: 0, max: 1 }) // normalised value

         setScrolledTop(normal * hiddenHeight)
      }, [thumb])
      // Make wrap scroll on scrolledTop updates
      useEffect(() => {
         wrapRef.current.scrollTo({ top: scrolledTop, behavior: (isDragging ? "instant" : "smooth") as ScrollBehavior })
         onScroll && onScroll(scrolledTop) // Parent component callback
      }, [scrolledTop])

      /* Method scroll(current => current + 2) for consumers (of context provider) */

      const scroll = (callback: ((diff: number) => number) | number) => {
         if (!contentRef.current || !containerRef.current) return

         const toY = typeof callback === "number" ? callback : callback(scrolledTop)
         const hiddenHeight = contentRef.current.clientHeight - containerRef.current.clientHeight

         setScrolledTop(clamp(toY, { min: 0, max: hiddenHeight }))
      }

      return (
         <ScrollContext.Provider value={{ scrolledY: thumb.y > 2 ? 32 : 0, scroll }}>
            <div {...atts} ref={fwdRef ?? intContainerRef} className={`custom-scroll-parent ${styles.container} ${atts.className}`}>
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
                              height: `${thumb.height}%`,
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
)

// Context Provider

interface ScrollContextProps {
   /** Current */
   scrolledY: number
   /** Scroll to */
   scroll: (callback: ((scrolledY: number) => number) | number) => void
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
   containerRef: FwdRef
   contentRef: FwdRef
   trackRef: FwdRef
}

/** Calculates thumb height relative to scrollable content, handles clamped dragging position */
function useScrollThumb({ containerRef, contentRef, trackRef }: HookProps) {
   const [thumb, setThumb] = useState({ y: 0, height: 0 })
   // Internal State
   const [emptySpace, setEmptySpace] = useState(0)
   const prevDyRef = useRef(0)
   const clampThumbY = (value) => clamp(value, { min: 0, max: emptySpace })

   /* Initialize thumb height */
   useLayoutEffect(() => {
      if (contentRef.current && trackRef.current) {
         const thumbNormal = containerRef.current.clientHeight / contentRef.current.clientHeight
         setThumb((prev) => ({ ...prev, height: thumbNormal * 100 }))
         const emptySpace = trackRef.current.clientHeight * (1 - thumbNormal)
         setEmptySpace(emptySpace || undefined)
      }
   }, [contentRef])

   /* Controlled thumb position  */

   // 1 Drag Event
   const { initDrag, isDragging } = useDrag({
      callbacks: {
         move: (_, { dy }) => {
            const diffDy = dy - prevDyRef.current
            setThumb((prev) => ({ ...prev, y: clampThumbY(prev.y + diffDy) }))
            prevDyRef.current = dy
         },
         up: (_, { dy }) => {
            const diffDy = dy - prevDyRef.current
            setThumb((prev) => ({ ...prev, y: clampThumbY(prev.y + diffDy) }))
            prevDyRef.current = 0
         },
      },
   })

   // 2 Wheel Event
   const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      setThumb((prev) => ({ ...prev, y: clampThumbY(prev.y + e.deltaY) }))
   }

   useEventListener("wheel", onWheel, { element: containerRef.current })

   // 3 Track Click Event
   const onTrackClick = (e: MouseEvent) => {
      if (!trackRef.current || e.target !== trackRef.current) return
      /* Place thumb at center of event */
      const { top } = trackRef.current.getBoundingClientRect()
      setThumb((prev) => ({ ...prev, y: clampThumbY(e.clientY - top - (prev.height / 2) * 100) }))
   }

   useEventListener("mousedown", onTrackClick, { element: trackRef.current })

   return { thumb, isDragging, initDrag }
}

export { CustomScroll, useScrollCtx }
