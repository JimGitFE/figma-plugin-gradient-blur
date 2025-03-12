import { useEffect, useRef } from "react"

/** Frame logic (executed as callback) */
type FrameLoop = (deltaTime: number) => void

interface Config {
   /** Run loop while true */
   conditional?: boolean
}

/** Animation Frame loop logic */
export default function useAnimation(frame: FrameLoop, deps: React.DependencyList, { conditional = true }: Config) {
   const lastTimeRef = useRef(null)
   useEffect(() => {
      let frameId: number

      const frameLoop = (timestamp: number) => {
         //  if (lastTimeRef.current === null) lastTimeRef.current = timestamp

         frameId = requestAnimationFrame(frameLoop)
         frame(lastTimeRef.current !== null ? timestamp - lastTimeRef.current : 0) // callback

         lastTimeRef.current = timestamp
      }

      if (conditional) frameId = requestAnimationFrame(frameLoop)

      return () => {
         lastTimeRef.current = null
         cancelAnimationFrame(frameId)
      }
   }, [...deps]) // Deps, updated value made available inside loop
}
