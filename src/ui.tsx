import React, { useEffect } from "react"
import "./styles/globals.scss" // Import your CSS file
// import "./styles/utilities.css" // Import your CSS file

import Button from "@/components/Button"
import Theme from "./components/Theme"
import useDynamicState from "./hooks/useDynamicState"
import Input from "./components/Input/input"
import InputButton from "./components/Input/button"

const DEFAULT_RESOLUTION = 5
const DEFAULT_HANDLES = [
   { pos: 0, blur: 10 },
   { pos: 75, blur: 4 },
   { pos: 100, blur: 0 },
]

function Interface() {
   const [grad, setGrad] = useDynamicState({ resolution: DEFAULT_RESOLUTION, handles: DEFAULT_HANDLES })

   const onCreate = () => {
      // const count = parseInt(textbox.current.value, 10)
      parent.postMessage({ pluginMessage: { type: "create", grad } }, "*")
   }

   const onCancel = () => {
      parent.postMessage({ pluginMessage: { type: "cancel" } }, "*")
   }

   useEffect(() => {
      // This is how we read messages sent from the plugin controller
      window.onmessage = (event) => {
         const { type, message } = event.data.pluginMessage
         if (type === "create-rectangles") {
            console.log(`Figma Says: ${message}`)
         }
      }
   }, [])

   return (
      <Theme>
         <section className={`d-f fd-co gap-6px c-white type--small type--medium type--inverse`}>
            {/* <img src={logo} /> */}
            <h2>Rectangle Creator</h2>

            <hr></hr>
            <p className="p-small type--inverse">Resolution:</p>

            {/* Gradient Type */}
            <div className={`d-f gap-5px`}>
               <InputButton
                  style={{ width: 187 }}
                  buttons={[
                     { value: false, text: "Radial" },
                     { value: false, text: "Linear" },
                  ]}
               />
            </div>

            {/* Resolution & Angle */}
            <div className={`d-f gap-5px w-187px`}>
               <Input
                  style={{ flex: 1 }}
                  inputs={[
                     {
                        onChange: (e) => {
                           setGrad("resolution", Number((e.target as HTMLInputElement).value))
                        },
                        value: grad.resolution,
                        placeholder: "Blur in px",
                        icon: "image",
                        style: { width: 24 },
                     },
                  ]}
               />
               <InputButton
                  buttons={[
                     { value: false, icon: "rotate" },
                     { value: false, icon: "mirror-y" },
                     { value: false, icon: "mirror-x" },
                  ]}
               />
            </div>

            <hr></hr>
            {/* Parameters */}

            {/* Title */}
            <div className="d-f jc-sb ai-c w-187px">
               <p className="p-small type--inverse">Blur handle steps:</p>
               <InputButton buttons={[{ value: false, icon: "swap", large: true }]} />
            </div>

            {/* Inputs Handles */}
            <div className={`d-f fd-co gap-6px w-187px`}>
               <div className="d-f gap-6px">
                  <Input
                     inputs={[
                        // blur value
                        {
                           onChange: (e) => {
                              setGrad("handles", (prev) => {
                                 return prev.map((item, index) => {
                                    if (index === 0) {
                                       // Update the condition to match the specific object you want to update
                                       return { ...item, blur: Number((e.target as HTMLInputElement).value) }
                                    }
                                    return item
                                 })
                              })
                           },
                           value: grad.handles[0].blur,
                           placeholder: "Blur in px",
                           icon: "image",
                        },
                        // position
                        { after: <span>%</span>, value: grad.handles[2].blur, placeholder: "Blur in px", style: { width: 52, flex: 0 } },
                     ]}
                  />
                  <InputButton buttons={[{ value: false, icon: "minus", large: true }]} />
               </div>
               <div className="d-f gap-6px">
                  <Input
                     inputs={[
                        // blur value
                        {
                           onChange: (e) => {
                              setGrad("handles", (prev) => {
                                 return prev.map((item, index) => {
                                    if (index === 1) {
                                       // Update the condition to match the specific object you want to update
                                       return { ...item, blur: Number((e.target as HTMLInputElement).value) }
                                    }
                                    return item
                                 })
                              })
                           },
                           value: grad.handles[1].blur,
                           placeholder: "Blur in px",
                           icon: "image",
                        },
                        // position
                        { after: <span>%</span>, value: grad.handles[2].blur, placeholder: "Blur in px", style: { width: 52, flex: 0 } },
                     ]}
                  />
                  <InputButton buttons={[{ value: false, icon: "minus", large: true }]} />
               </div>
               <div className="d-f gap-6px">
                  <Input
                     inputs={[
                        // blur value
                        {
                           onChange: (e) => {
                              setGrad("handles", (prev) => {
                                 return prev.map((item, index) => {
                                    if (index === 2) {
                                       // Update the condition to match the specific object you want to update
                                       return { ...item, blur: Number((e.target as HTMLInputElement).value) }
                                    }
                                    return item
                                 })
                              })
                           },
                           value: grad.handles[2].blur,
                           placeholder: "Blur in px",
                           icon: "image",
                        },
                        // position
                        { after: <span>%</span>, value: grad.handles[2].blur, placeholder: "Blur in px", style: { width: 52, flex: 0 } },
                     ]}
                  />
                  <InputButton buttons={[{ value: false, icon: "minus", large: true }]} />
               </div>
            </div>

            {/* Submit */}
            <div className={`d-f gap-8px mt-16px`}>
               <Button className="w-80px" onClick={onCreate}>
                  Create
               </Button>
               <Button onClick={onCancel} secondary>
                  Cancel
               </Button>
            </div>
         </section>
      </Theme>
   )
}

export default Interface
