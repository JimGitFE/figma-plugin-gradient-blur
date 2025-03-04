/** Properties Panel Input sections */
// Dependencies
import React from "react"
// Components
import { Reorderable } from "@/components/custom"
import { Button, SmallButton, SmallButtons, Input } from "@/components/figma"
// Internal
import { HandleInput } from "./HandleInput"
import styles from "./properties.module.scss"
import { Heading } from "./Heading"
import { clamp, modulo } from "@/utils"
import { useProperties } from "@/store"

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
   children?: React.ReactNode
}

export function PropertiesPanel({ children, ...atts }: PanelProps) {
   const onCreate = () => {
      // const count = parseInt(textbox.current.value, 10)
      parent.postMessage({ pluginMessage: { type: "create", grad: "grad" } }, "*")
   }

   const onCancel = () => {
      parent.postMessage({ pluginMessage: { type: "cancel" } }, "*")
   }

   return (
      <div {...atts}>
         {/* Main Title */}
         <section>
            <Heading buttons={[{ icon: "ellipses" }]}>
               <h3 className={`fs-14px fw-550`}>Properties Panel</h3>
            </Heading>
         </section>

         <hr />

         {/* Properties */}
         <div className={styles.container}>
            <PanelInputs />
         </div>

         <hr />

         {/* Submit */}
         <section>
            <div className={`d-f jc-fe gap-8px`}>
               <Button onClick={onCancel} style={{ flex: 1.5 }} label="Cancel" secondary />
               <Button onClick={onCreate} style={{ flex: 2 }} label="Create" />
            </div>
         </section>

         <hr />

         {/* Caption */}
         <section>
            <div className="d-f ai-c mt-4px gap-12px o-60">
               {/* <div className="icon icon--warning icon--white8 o-80" /> */} {/* On Frame with children */}
               <div className="icon icon--resolve icon--white8 o-80" />
               <p>
                  <small>Insert Linear Gradient Blur into empty frame "Progressive".</small>
               </p>
            </div>
         </section>
      </div>
   )
}

interface InputProps {
   // dynamicState: any
}

import { useShallow } from "zustand/shallow"

/** Adjustable Properties of Panel (No actions / header ) */
function PanelInputs({}: InputProps) {
   const [setGrad, updateHandle] = useProperties(useShallow((state) => [state.setGrad, state.updateHandle]))
   const { angle, resolution, handles } = useProperties((state) => state.grad)

   return (
      <>
         <section>
            {/* Title */}
            <Heading buttons={[{ isActive: false, icon: "info" }]}>
               <p>Resolution / Type</p>
            </Heading>

            {/* Gradient Type */}
            <div className={`d-f gap-5px`}>
               <SmallButtons style={{ flex: 1 }} buttons={[{ icon: "rotate" }, { icon: "mirror-y" }, { icon: "mirror-x" }]} />
               <SmallButtons
                  style={{ width: "auto", flex: 1 }}
                  buttons={[
                     { isActive: true, text: "Lin" },
                     { isActive: false, text: "Rad" },
                  ]}
               />
               <SmallButton icon="adjust" large disabled /> {/* TODO */}
            </div>

            {/* Resolution & Angle */}
            <div className={`d-f gap-5px`}>
               <Input
                  style={{ flex: 1 }}
                  value={angle}
                  display={(v) => `${modulo(Math.round(v), 359)}°`}
                  onChange={(newVal) => setGrad({ angle: Number(newVal.replace("°", "")) })}
                  icon={"angle"}
                  placeholder={"Gradient Angle"}
               />
               <Input
                  style={{ flex: 1 }}
                  value={resolution}
                  display={(v) => Math.round(v)}
                  onChange={(newVal) => setGrad({ resolution: clamp(newVal, { min: 1 }) })}
                  resize={{ strength: 0.1 }}
                  icon={"steps"}
                  placeholder={"Resolution Steps"}
               />
               <div className="w--space-24" />
            </div>
         </section>

         <hr className="" />

         {/* Parameters */}
         <section>
            {/* Title */}
            <Heading buttons={[{ icon: "swap" }, { icon: "plus" }]}>
               <p>Gradient Handles</p>
            </Heading>

            {/* Inputs Handles */}
            <div className={`d-f fd-co gap-6px`} style={{ marginTop: -3, marginBottom: -3 }}>
               <Reorderable onReorder={(newSource) => setGrad({ handles: newSource })} sources={handles}>
                  {handles.map((handle, index) => (
                     <HandleInput id={String(handle.uniqueId)} handle={handles[index]} setHandle={(patch) => updateHandle(index, patch)} />
                  ))}
               </Reorderable>
            </div>
         </section>
      </>
   )
}
