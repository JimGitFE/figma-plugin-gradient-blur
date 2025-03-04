/** Properties Panel Input sections */
// Dependencies
import React from "react"
// Components
import useDynamicState from "@/hooks/useDynamicState"
import { Reorderable } from "@/components/custom"
import { Button, SmallButton, SmallButtons, Input } from "@/components/figma"
// Internal
import { HandleInput } from "./HandleInput"
import styles from "./properties.module.scss"
import { Heading } from "./Heading"
import { clamp, modulo } from "@/utils"

const DEFAULT_RESOLUTION = 5
const DEFAULT_HANDLES = [
   { pos: 0, blur: 10, id: 1 },
   { pos: 75, blur: 4, id: 2 },
   { pos: 100, blur: 0, id: 3 },
]

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
   children?: React.ReactNode
}

export function PropertiesPanel({ children, ...atts }: PanelProps) {
   const [grad, setGrad] = useDynamicState({ angle: 0, resolution: DEFAULT_RESOLUTION, handles: DEFAULT_HANDLES })

   const onCreate = () => {
      // const count = parseInt(textbox.current.value, 10)
      parent.postMessage({ pluginMessage: { type: "create", grad } }, "*")
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

         <hr className="" />

         {/* Properties */}
         <div className={styles.container}>
            <PanelInputs dynamicState={[grad, setGrad]} />
         </div>

         <hr className="" />

         {/* Submit */}
         <section>
            <div className={`d-f jc-fe gap-8px`}>
               <Button onClick={onCancel} style={{ flex: 1.5 }} label="Cancel" secondary />
               <Button onClick={onCreate} style={{ flex: 2 }} label="Create" />
            </div>
         </section>

         <hr className="" />

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
   dynamicState: any
}

/** Adjustable Properties of Panel (No actions / header ) */
function PanelInputs({ dynamicState }: InputProps) {
   const [grad, setGrad] = dynamicState

   const onHandleChange = (newProp, rowIndex) => {
      setGrad("handles", (prev) => prev.map((item, index) => (index === rowIndex ? { ...item, ...newProp } : item)))
   }

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
                  onChange={(e) =>
                     setGrad("angle", () => {
                        return Number(e.target.value.replace("°", ""))
                     })
                  }
                  icon={"angle"}
                  value={grad.angle}
                  display={(v) => `${modulo(Math.round(Number(v)), 359)}°`}
                  placeholder={"Gradient Angle"}
               />
               <Input
                  style={{ flex: 1 }}
                  onChange={(e) => setGrad("resolution", clamp(Number(e.target.value), { min: 1 }))}
                  display={(v) => `${Math.round(Number(v))}`}
                  resize={{ strength: 0.1 }}
                  icon={"steps"}
                  value={grad.resolution}
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
               <Reorderable onReorder={(newSource) => setGrad("handles", newSource)} sources={grad.handles}>
                  {grad.handles.map((handle, index) => (
                     <HandleInput id={handle.id} grad={grad.handles[index]} setGrad={(prop) => onHandleChange(prop, index)} />
                  ))}
               </Reorderable>
            </div>
         </section>
      </>
   )
}
