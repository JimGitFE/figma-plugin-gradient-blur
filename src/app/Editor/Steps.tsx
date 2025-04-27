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
   const [setGrad] = useProperties(useShallow((state) => [state.setGrad, state.updateHandle]))
   const { handles } = useProperties((state) => state.grad)

   return (
      <section>
         {/* Title */}
         <Heading
            buttons={[
               { icon: "swap", tip: "Reset" },
               { icon: "plus", tip: "Create" },
            ]}
         >
            <p onClick={() => setGrad({ handles: handles.sort((a, b) => a.blur - b.blur) })}>Gradient Handles ({handles.length})</p>
         </Heading>

         {/* Inputs Handles */}
         <div className={`d-f fd-co gap-6px ${styles.steps}`} style={{ marginTop: -3, marginBottom: -3 }}>
            <Reorder.Container onReorder={(newHandles) => setGrad({ handles: newHandles })} sources={handles}>
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
