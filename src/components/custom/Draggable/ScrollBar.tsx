// Dependencies
import React, { forwardRef, useEffect, useLayoutEffect, useRef, useState } from "react"
// Components
import { useEventListener } from "@/hooks/useEventListener"
import { clamp } from "@/utils"
import useDrag from "@/hooks/useDrag"
// Internal
import styles from "./scrollbar.module.scss"

type FwdRef = React.RefObject<HTMLDivElement>

interface Props extends React.HTMLAttributes<HTMLDivElement> {
   /** Includes wrap & track (attach wheel listener) */
   track?: React.HTMLAttributes<HTMLDivElement>
   thumb?: React.HTMLAttributes<HTMLDivElement>
   children?: React.ReactNode
}

/** Wrapper */
const ScrollBar = forwardRef<HTMLDivElement, Props>(
   ({ thumb: thumbAtts, track: trackAtts, children, ...atts }, fwdContainerRef: FwdRef) => {
      /** Container */
      const intContainerRef = useRef<HTMLDivElement>(null)
      const containerRef = fwdContainerRef || intContainerRef
      /** Scrollable content wrapper */
      const wrapRef = useRef<HTMLDivElement>(null) // defines scroll
      /** Overflowed content */
      const contentRef = useRef<HTMLDivElement>(null) // overflowed content
      /** Scroll Track */
      const trackRef = useRef<HTMLDivElement>(null)

      const { thumb, isDragging, initDrag } = useScrollThumb({ containerRef, contentRef, trackRef })

      /* Controlled scrollable container top  */
      useEffect(() => {
         if (!contentRef.current || !containerRef.current) return

         const hiddenHeight = contentRef.current.clientHeight - containerRef.current.clientHeight
         const normal = clamp(thumb.y, { min: 0, max: 1 }) // normalised value

         wrapRef.current.scrollTo({ top: normal * hiddenHeight, behavior: (isDragging ? "instant" : "smooth") as ScrollBehavior })
      }, [thumb])

      return (
         <div {...atts} ref={fwdContainerRef ?? intContainerRef} className={`custom-scroll-parent ${styles.container} ${atts.className}`}>
            <div ref={wrapRef} className={`${styles.wrap} pos-relative`}>
               <div ref={contentRef}>{children}</div>
            </div>
            {/* ScrollBar */}
            {true && (
               <div {...trackAtts} className={`${styles.track} ${trackAtts?.className} custom-scroll-track`}>
                  {/* Track */}
                  <div ref={trackRef} className={`${styles["thumb-track"]}`}>
                     {/* Thumb */}
                     <div
                        onMouseDown={initDrag}
                        style={{
                           transform: `translateY(${thumb.y}px)`,
                           height: `${thumb.height * 100}%`,
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
      )
   }
)

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
   /** Thumb Y max */
   const clampThumbY = (value) => clamp(value, { min: 0, max: emptySpace })

   /* Initialize thumb height */
   useLayoutEffect(() => {
      if (contentRef.current && trackRef.current) {
         const thumbHeight = trackRef.current.clientHeight / contentRef.current.clientHeight
         setThumb((prev) => ({ ...prev, height: thumbHeight }))
         const emptySpace = trackRef.current.clientHeight * (1 - thumbHeight)
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

   return { thumb, isDragging, initDrag }
}

export { ScrollBar }
