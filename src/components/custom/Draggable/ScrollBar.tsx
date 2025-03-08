// Dependencies
import React, { useEffect, useLayoutEffect, useRef, useState } from "react"
// Components
import { useEventListener } from "@/hooks/useEventListener"
import { clamp } from "@/utils"
import useDrag from "@/hooks/useDrag"
// Internal
import styles from "./scrollbar.module.scss"

interface Props {
   /** Includes wrap & track (attach wheel listener) */
   containerRef: React.RefObject<HTMLDivElement>
   /** Scrollable content wrapper */
   wrapRef: React.RefObject<HTMLDivElement>
   /** Overflowed content */
   contentRef: React.RefObject<HTMLDivElement>
   track?: React.HTMLAttributes<HTMLDivElement>
   thumb?: React.HTMLAttributes<HTMLDivElement>
}

function ScrollBar({ thumb, track, contentRef, wrapRef, containerRef }: Props) {
   // Dimensions
   const trackRef = useRef<HTMLDivElement>(null)
   const [thumbHeight, setThumbHeight] = useState(0)
   const [emptySpace, setEmptySpace] = useState(0)

   /* Initialize thumb height */
   useLayoutEffect(() => {
      if (contentRef.current && trackRef.current) {
         const thumbHeight = trackRef.current.clientHeight / contentRef.current.clientHeight
         setThumbHeight(thumbHeight)
         const emptySpace = trackRef.current.clientHeight * (1 - thumbHeight)
         setEmptySpace(emptySpace || undefined)
      }
   }, [contentRef])

   /* Controlled thumb position  */

   const [thumbY, setThumbY] = useState(0)
   const prevDyRef = useRef(0)
   /** Thumb Y max */
   const clampThumbY = (value) => clamp(value, { min: 0, max: emptySpace })

   // 1 Drag Event
   const { initDrag, isDragging } = useDrag({
      callbacks: {
         move: (_, { dy }) => {
            const diffDy = dy - prevDyRef.current
            setThumbY(clampThumbY(thumbY + diffDy))
            prevDyRef.current = dy
         },
         up: (_, { dy }) => {
            const diffDy = dy - prevDyRef.current
            setThumbY(clampThumbY(thumbY + diffDy))
            prevDyRef.current = 0
         },
      },
   })

   // 2 Wheel Event
   const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      setThumbY(clampThumbY(thumbY + e.deltaY))
   }
   useEventListener("wheel", onWheel, { element: containerRef.current })

   /* Controlled scrollable container top  */
   useEffect(() => {
      if (!contentRef.current || !containerRef.current) return

      const hiddenHeight = contentRef.current.clientHeight - containerRef.current.clientHeight
      const normal = clamp(thumbY / emptySpace, { min: 0, max: 1 }) // normalised value

      wrapRef.current.scrollTo({ top: normal * hiddenHeight, behavior: isDragging ? "instant" : "smooth" })
   }, [thumbY])

   return (
      // Track User Style
      <div
         {...track}
         style={{ display: emptySpace === undefined && "none" }}
         className={`${styles.track} ${track?.className ?? styles.default}`}
      >
         {/* Track */}
         <div ref={trackRef} className={`${styles["thumb-track"]}`}>
            {/* Thumb */}
            <div
               onMouseDown={initDrag}
               style={{
                  transform: `translateY(${thumbY}px)`,
                  height: `${thumbHeight * 100}%`,
               }}
               className={styles.thumb}
            >
               {/* User Thumb style */}
               <div {...thumb} className={`${styles.handle} ${thumb?.className ?? styles.default}`} />
            </div>
         </div>
      </div>
   )
}

export { ScrollBar }
