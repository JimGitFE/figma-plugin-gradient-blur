"use client"
import React, { useState, useEffect, useRef, CSSProperties, HTMLAttributes } from "react"

/** Default transition */
const TRANSITION: [CSSProperties, CSSProperties] = [
   { opacity: 0, transform: "translateY(30px)" },
   { opacity: 1, transform: "translateY(0)" },
]

interface UnmountProps extends HTMLAttributes<HTMLDivElement> {
   /**Determine Module state */
   conditional: boolean
   children: React.ReactNode
   /**Duration in ms */
   duration: number
   className?: string
   /** transitionIndx Changes After Mounting thus cannot use conditional directly
    *
    * **Solution, examples:**
    *
    * {height: [250, 0]} =>  {height: **`transitionIndx`**?250:0}
    *
    * {opacity: [1, 0]} =>  {opacity: **`transitionIndx`**?1:0}
    */
   styleTransition?: [CSSProperties, CSSProperties]
}

/** Delayed children unmounting, resetted on `conditional` conditional update */
function DelayedUnmount({ conditional, duration, styleTransition = TRANSITION, ...atts }: UnmountProps) {
   const [transitionIndx, setTransitionIndx] = useState(false)
   const [isRendered, setIsRendered] = useState(true)
   const timeoutIdRef = useRef<NodeJS.Timeout | number | null>(null)

   useEffect(() => {
      setIsRendered(true)
      requestAnimationFrame(() => setTransitionIndx(conditional))

      if (conditional) {
         // eslint-disable-next-line @typescript-eslint/no-unused-expressions
         timeoutIdRef.current && clearTimeout(timeoutIdRef.current)
         setIsRendered(true)
      } else {
         timeoutIdRef.current = setTimeout(() => {
            setIsRendered(conditional)
         }, duration)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [conditional]) // duration is not a dependency

   // prettier-ignore
   return (conditional||isRendered)&&(<div {...atts} style={{ ...styleTransition[transitionIndx?1:0] }}  />)
}

export { DelayedUnmount }

/**
 * Bug #1: Late removal of the element
 * Example:
 * duration: 10s
 * Double tap at second 7 => animation ends in 3 seconds isRendered is setted to false in 10 (7 after the second tap)
 */
