import { useState } from "react"
import { useEventListener } from "./useEventListener"

type Axes = "x" | "y"
type Pos = { x?: number; y?: number }

// callback send event and distance traveled
type Callback<A extends Axes> = (e: EventFor<MouseEvent>, distance: DistanceFor<A>) => void

interface Props<A extends Axes> {
   /** Safe use singe axis */
   callbacks?: {
      down?: Callback<A>
      move?: Callback<A>
      up?: Callback<A>
   }
}

type DistanceFor<A extends Axes, O = {}> = A extends undefined
   ? { dx: number; dy: number } & O
   : A extends "y"
   ? { dy: number } & O
   : { dx: number } & O

type Return = {
   initDrag: (e: EventFor<MouseEvent>) => void
   isDragging: boolean
   downPos: Pos
}

export default function useDrag<A extends Axes = undefined>({ callbacks = {} }: Props<A> = {}): DistanceFor<A, Return> {
   const [clientPos, setClientPos] = useState<Pos>({ x: null, y: null })
   const [downPos, setDownPos] = useState<Pos>({ x: null, y: null })

   const isDragging = typeof clientPos.x === "number" && typeof clientPos.y === "number"

   const [dx, dy] = isDragging ? [clientPos.x - downPos.x, clientPos.y - downPos.y] : [null, null]

   const initDrag = (e: EventFor<MouseEvent>) => {
      setDownPos({ x: e.clientX, y: e.clientY })
      setClientPos({ x: e.clientX, y: e.clientY })
      callbacks.down && callbacks.down(e, { dx, dy } as DistanceFor<A>)
   }

   const onMouseMove = (e) => {
      setClientPos({ x: e.clientX, y: e.clientY })
      callbacks.move && callbacks.move(e, { dx, dy } as DistanceFor<A>)
   }

   const onMouseUp = (e) => {
      setDownPos({ x: null, y: null })
      setClientPos({ x: null, y: null })
      callbacks.up && callbacks.up(e, { dx, dy } as DistanceFor<A>)
   }

   // Listeners
   useEventListener("mousemove", onMouseMove, { conditional: isDragging })
   useEventListener("mouseup", onMouseUp, { conditional: isDragging })

   return { dx, dy, initDrag, isDragging, downPos } as DistanceFor<A, Return>
}

// TODO: while dragging, disable initDrag until mouseup
