import { useRef, useState } from "react"
import { useEventListener } from "./useEventListener"

interface Props {
   initial?: boolean
}

/** Show & hide modal element compsoed of trigger button & element (with listener) */
export default function useModal({ initial = false }: Props = {}) {
   const [display, setDisplay] = useState(initial)
   const modalRef = useRef<HTMLDivElement>(null)
   const actionRef = useRef<HTMLButtonElement>(null)

   useEventListener(
      "click",
      (e) => !modalRef.current?.contains(e.target as Node) && !actionRef.current?.contains(e.target as Node) && setDisplay(false),
      { conditional: display }
   )
   return { display, setDisplay, modalRef, actionRef }
}
