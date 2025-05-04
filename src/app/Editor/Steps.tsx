// Dependencies
import React from "react"
import { useShallow } from "zustand/shallow"
// Components
import { Heading, HandleInput } from "@/components/layout"
import { Reorder } from "@/components/custom"
import { useProperties } from "@/store"
// Internal
import styles from "./steps.module.scss"

interface InputProps {
   // dynamicState: any
}

/** Gradient handles, position & blur amount */
export default function PanelInputs({}: InputProps) {
   const [setGrad, addHandle] = useProperties(useShallow((state) => [state.setGrad, state.addHandle, state.updateHandle]))
   const { handles } = useProperties((state) => state.grad)
   const last = handles[handles.length - 1] ?? { pos: 100, blur: 0 }

   return (
      <section>
         {/* Title */}
         <Heading
            buttons={[
               { icon: "swap", tip: "Reset" },
               { icon: "plus", tip: "Create", onClick: () => addHandle({ pos: last.pos + 1, blur: last.blur }) },
            ]}
         >
            <p onClick={() => setGrad({ handles: handles.sort((a, b) => a.blur - b.blur) })}>Gradient Handles ({handles.length})</p>
         </Heading>

         {/* Inputs Handles */}
         <div className={`d-f fd-co gap-6px ${styles.steps}`} style={{ marginTop: -3, marginBottom: -3 }}>
            <Reorder.Container
               onReorder={(newHandles, dropped) => setGrad({ handles: computeIntPos(newHandles, dropped.index) })}
               sources={handles}
            >
               {handles.map((handle) => (
                  <Reorder.Item uniqueId={handle.uniqueId}>
                     <HandleInput handle={handle} handleId={handle.uniqueId} />
                  </Reorder.Item>
               ))}
            </Reorder.Container>
         </div>
      </section>
   )
}

// Utils

/** Dropped item - recalculate intermediate pos out of neighbours */
const computeIntPos = (data: GradientStep[], at: number) => {
   const prev = data[at - 1] ?? { pos: Math.min(0, data[at + 1].pos) }
   const next = data[at + 1] ?? { pos: Math.max(100, data[at - 1].pos) }

   // Compute new position
   const newData = data.map((h, i) => {
      if (i === at) {
         return { ...h, pos: (prev.pos + next.pos) / 2 }
      }
      return h
   })
   return newData
}
