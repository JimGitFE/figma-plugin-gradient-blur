import { useEffect, useRef } from "react"

/** Frame logic (executed as callback) */
type FrameLoop = (deltaTime: number) => void

interface Config {
   /** Run loop while true */
   conditional?: boolean
}

/** Animation Frame loop logic */
export default function useAnimation(frame: FrameLoop, deps: React.DependencyList, { conditional = true }: Config) {
   const lastTimeRef = useRef(performance.now())
   useEffect(() => {
      let frameId: number

      const frameLoop = (time: number) => {
         const deltaTime = time - lastTimeRef.current
         lastTimeRef.current = time
         frameId = requestAnimationFrame(frameLoop)
         frame(deltaTime) // callback
      }

      if (conditional) frameId = requestAnimationFrame(frameLoop)

      return () => cancelAnimationFrame(frameId)
   }, [...deps]) // Deps, updated value made available inside loop
}
