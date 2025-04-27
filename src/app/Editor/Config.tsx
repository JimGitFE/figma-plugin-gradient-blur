// Dependencies
import React from "react"
import { useShallow } from "zustand/shallow"
// Components
import { ActionButton, ActionButtonBase, ActionContainer, InputArea } from "@/components/figma"
import { Heading } from "@/components/layout"
import { useProperties } from "@/store"
import { clamp, modulo } from "@/utils"

/** Adjustable Properties of Panel */
export default function Config() {
   const [setGrad] = useProperties(useShallow((state) => [state.setGrad, state.updateHandle]))
   const { angle, resolution } = useProperties((state) => state.grad)

   return (
      <section>
         {/* Title */}
         <Heading buttons={[{ isActive: false, icon: "info", tip: "Info" }]}>
            <p>Resolution / Type</p>
         </Heading>

         {/* Gradient Type */}
         <div className={`d-f gap-5px`}>
            <ActionContainer style={{ flex: 1 }}>
               <ActionButtonBase icon="rotate" tooltip={{ text: "Rotate 90 degrees" }} />
               <ActionButtonBase icon="mirror-y" tooltip={{ text: "Mirror y axis" }} />
               <ActionButtonBase icon="mirror-x" tooltip={{ text: "Mirror x axis" }} />
            </ActionContainer>
            <ActionContainer style={{ width: "auto", flex: 1 }}>
               <ActionButtonBase text="Lin" tooltip={{ text: "Linear Gradient" }} isActive />
               <ActionButtonBase text="Rad" tooltip={{ text: "Radial Gradient" }} />
            </ActionContainer>
            <ActionButton icon="adjust" tooltip={{ text: "Disabled" }} large disabled />
            {/* TODO }}*/}
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
            <div style={{ width: 24 + 2 }} />
         </div>
      </section>
   )
}
