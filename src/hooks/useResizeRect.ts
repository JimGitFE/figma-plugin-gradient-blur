import { useEffect, useState } from "react"

interface Props {
   ref: React.MutableRefObject<HTMLDivElement>
   callback?: (rect: DOMRect, unmount: () => void) => void
   //  unmount?: () => void
}

/** div ref Resize Observer */
function useResizeRect({ ref, callback }: Props) {
   const [rect, setRect] = useState<DOMRect>(null)
   const [unmount, setUnmount] = useState(false)

   useEffect(() => {
      const container = ref.current
      if (!container) return
      if (unmount) return

      const resizeObserver = new ResizeObserver((entries) => {
         for (let entry of entries) {
            setRect(entry.contentRect)
         }
      })

      resizeObserver.observe(container)

      // Cleanup on unmount
      return () => resizeObserver.unobserve(container)
   }, [ref, unmount])

   /** on Resize callback */
   useEffect(() => {
      callback && rect && callback(rect, () => setUnmount(true))
   }, [rect])

   return { rect, unmount: () => setUnmount(true) }
}

export { useResizeRect }
