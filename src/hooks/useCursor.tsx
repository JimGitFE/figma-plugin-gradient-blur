import { useState, useEffect } from "react"

type Cursor = (typeof CURSORS)[number]

interface CursorConfig {
   // children: ReactNode
   setWhile?: boolean
   initialCursor?: Cursor
}

/** Overrides all stylesheet cursors */
export function useCursor({ initialCursor, setWhile = true }: CursorConfig) {
   const [cursorClass, setCursorClass] = useState<`force-${Cursor}`>(`force-${initialCursor}`)

   useEffect(() => {
      if (cursorClass && setWhile) {
         document.body.classList.add(cursorClass)
         return () => {
            document.body.classList.remove(cursorClass)
         }
      }
   }, [cursorClass, setWhile])

   return { setCursorClass }
}

const CURSORS = [
   "alias",
   "all-scroll",
   "auto",
   "cell",
   "context-menu",
   "col-resize",
   "copy",
   "crosshair",
   "default",
   "e-resize",
   "ew-resize",
   "grab",
   "grabbing",
   "help",
   "move",
   "n-resize",
   "ne-resize",
   "nesw-resize",
   "ns-resize",
   "nw-resize",
   "nwse-resize",
   "no-drop",
   "none",
   "not-allowed",
   "pointer",
   "progress",
   "row-resize",
   "s-resize",
   "se-resize",
   "sw-resize",
   "text",
   "vertical-text",
   "w-resize",
   "wait",
   "zoom-in",
   "zoom-out",
] as const
