// Dependencies
import React, { useEffect, useRef, useState } from "react"
// Components
import { useEventListener } from "@/hooks/useEventListener"
import { clamp } from "@/utils"
import useDrag from "@/hooks/useDrag"
// Internal
import styles from "./scrollbar.module.scss"

interface Props {
   /** Scrollable content wrapper */
   wrapRef: React.RefObject<HTMLDivElement>
   /** Overflowed content */
   contentRef: React.RefObject<HTMLDivElement>
   track?: React.HTMLAttributes<HTMLDivElement>
   thumb?: React.HTMLAttributes<HTMLDivElement>
}

function ScrollBar({ thumb, track, contentRef, wrapRef }: Props) {
   // Dimensions
   const trackRef = useRef<HTMLDivElement>(null)
   const [thumbHeight, setThumbHeight] = useState(0)
   const [emptySpace, setEmptySpace] = useState(0)

   /* Initialize thumb height */
   useEffect(() => {
      if (contentRef.current && trackRef.current) {
         const thumbHeight = trackRef.current.clientHeight / contentRef.current.clientHeight
         setThumbHeight(thumbHeight)
         const emptySpace = trackRef.current.clientHeight * (1 - thumbHeight)
         setEmptySpace(emptySpace)
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
   useEventListener("wheel", onWheel, { element: wrapRef.current })

   /* Controlled scrollable container top  */
   useEffect(() => {
      if (!contentRef.current || !trackRef.current) return

      const hiddenHeight = contentRef.current.clientHeight - trackRef.current.clientHeight
      const normal = clamp(thumbY / emptySpace, { min: 0, max: 1 }) // normalised value

      wrapRef.current.scrollTo({ top: normal * hiddenHeight, behavior: isDragging ? "instant" : "smooth" })
   }, [thumbY])

   return (
      // Track
      <div {...track} ref={trackRef} className={styles.track}>
         {/* Thumb */}
         <div
            {...thumb}
            onMouseDown={initDrag}
            style={{
               transform: `translateY(${thumbY}px)`,
               height: `${thumbHeight * 100}%`,
            }}
            className={styles.thumb}
         />
      </div>
   )
}

export { ScrollBar }
