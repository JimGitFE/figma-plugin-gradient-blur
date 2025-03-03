import { useState, useEffect } from "react"

type Cursor = (typeof CURSORS)[number]

interface CursorConfig {
   // children: ReactNode
   /** If initial cursor conditional `setWhile` required */
   initialCursor: Cursor
   setWhile: boolean
}

/** Overrides all stylesheet cursors */
export function useCursor({ initialCursor, setWhile }: CursorConfig | Partial<CursorConfig>) {
   const [cursorClass, setCursorClass] = useState<`force-${Cursor}` | null>(null)

   useEffect(() => {
      if (!setWhile) return
      setCursorClass(`force-${initialCursor}`)
      return () => setCursorClass(null)
   }, [setWhile])

   useEffect(() => {
      if (!cursorClass) return
      document.body.classList.add(cursorClass)
      return () => document.body.classList.remove(cursorClass)
   }, [cursorClass])

   const unsetGlobalCursor = () => setCursorClass(null)

   return { setGlobalCursor: setCursorClass, unsetGlobalCursor }
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
