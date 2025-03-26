/** Properties Panel Input sections */
// Dependencies
import React, { useState } from "react"
// Components
import { Reorder } from "@/components/custom"
import { Button, ActionButton, InputArea, ActionContainer, ActionButtonBase } from "@/components/figma"
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

   const [isMenu, setIsMenu] = useState(false)

   return (
      <div {...atts}>
         {/* Main Title */}
         <section>
            <Heading buttons={[{ icon: "ellipses", onClick: () => setIsMenu(!isMenu) }]} className="pos-relative">
               <h3 className={`fs-14px fw-550`}>Properties Panel</h3>
               <Menu className="mnw-170px" isOpen={isMenu}>
                  <MenuItem title="Add Gradient" />
                  <hr />
                  <MenuItem title="Add Gradient" command="Ctrl+K" />
                  <MenuItem title="Add Gradient" command="Ctrl+K" />
               </Menu>
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
            <div className="d-f ai-c mt-4px gap-12px o-60 mw-100">
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
import { Menu, MenuItem } from "@/components/figma/Menu"

/** Adjustable Properties of Panel (No actions / header ) */
function PanelInputs({}: InputProps) {
   const [setGrad] = useProperties(useShallow((state) => [state.setGrad, state.updateHandle]))
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
               <ActionContainer style={{ flex: 1 }}>
                  <ActionButtonBase icon="rotate" />
                  <ActionButtonBase icon="mirror-y" />
                  <ActionButtonBase icon="mirror-x" />
               </ActionContainer>
               <ActionContainer style={{ width: "auto", flex: 1 }}>
                  <ActionButtonBase text="Lin" isActive />
                  <ActionButtonBase text="Rad" />
               </ActionContainer>
               <ActionButton icon="adjust" large disabled /> {/* TODO */}
            </div>

            {/* Resolution & Angle */}
            <div className={`d-f gap-5px`}>
               <InputArea
                  style={{ flex: 1 }}
                  state={{
                     value: angle,
                     display: (v) => String(`${modulo(Math.round(v), 359)}°`),
                     parse: (v) => Number(v.replace("°", "")),
                     onChange: (newVal) => setGrad({ angle: newVal }),
                  }}
                  config={{
                     left: { icon: "angle" },
                     placeholder: "Gradient Angle",
                  }}
               />
               <InputArea
                  style={{ flex: 1 }}
                  state={{
                     value: resolution,
                     display: (v) => Math.round(v),
                     onChange: (newVal) => setGrad({ resolution: clamp(newVal, { min: 1 }) }),
                  }}
                  resize={{ strength: 0.1 }}
                  config={{
                     left: { icon: "steps" },
                     placeholder: "Resolution Steps",
                  }}
               />
               <div className="w--space-24" />
            </div>
         </section>

         <hr className="" />

         {/* Parameters */}
         <section>
            {/* Title */}
            <Heading buttons={[{ icon: "swap" }, { icon: "plus" }]}>
               <p onClick={() => setGrad({ handles: handles.sort((a, b) => a.blur - b.blur) })}>Gradient Handles ({handles.length})</p>
            </Heading>

            {/* Inputs Handles */}
            <div className={`d-f fd-co gap-6px ${styles.handles}`} style={{ marginTop: -3, marginBottom: -3 }}>
               <Reorder.Container onReorder={(newHandles) => setGrad({ handles: newHandles })} sources={handles}>
                  {handles.map((handle) => (
                     <Reorder.Item uniqueId={handle.uniqueId}>
                        <HandleInput handle={handle} handleId={handle.uniqueId} />
                     </Reorder.Item>
                  ))}
               </Reorder.Container>
            </div>
         </section>
      </>
   )
}
