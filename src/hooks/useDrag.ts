import { useState } from "react"
import { useEventListener } from "./useEventListener"

type Pos = { x?: number; y?: number }

interface DragHookProps {
   /** Safe use singe axis */
   axis?: "x" | "y"
   callbacks?: {
      down?: (e: MouseEvent | React.MouseEvent<HTMLDivElement, MouseEvent>) => void
      move?: (e: MouseEvent | React.MouseEvent<HTMLDivElement, MouseEvent>) => void
      up?: (e: MouseEvent | React.MouseEvent<HTMLDivElement, MouseEvent>) => void
   }
}

export default function useDrag({ axis, callbacks = {} }: DragHookProps = {}) {
   const [clientPos, setClientPos] = useState<Pos>({ x: null, y: null })
   const [downPos, setDownPos] = useState<Pos>({ x: null, y: null })

   const isDragging = typeof clientPos.x === "number" && typeof clientPos.y === "number"

   const onDragStart = (e: MouseEvent | React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      setDownPos({ x: e.clientX, y: e.clientY })
      setClientPos({ x: e.clientX, y: e.clientY })
      callbacks.down && callbacks.down(e)
   }

   const onMouseMove = (e) => {
      setClientPos({ x: e.clientX, y: e.clientY })
      callbacks.move && callbacks.move(e)
   }

   const onMouseUp = (e) => {
      setDownPos({ x: null, y: null })
      setClientPos({ x: null, y: null })
      callbacks.up && callbacks.up(e)
   }

   // Listeners
   useEventListener("mousemove", onMouseMove, { conditional: isDragging })
   useEventListener("mouseup", onMouseUp, { conditional: isDragging })

   const [dx, dy] = isDragging ? [clientPos.x - downPos.x, clientPos.y - downPos.y] : [null, null]

   if (axis === "x") return { dx, onDragStart, isDragging }
   if (axis === "y") return { dy, onDragStart, isDragging }

   return { dx, dy, onDragStart, isDragging }
}
