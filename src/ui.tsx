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
            {/* Resolution */}
            <p className="p-small type--inverse">Resolution:</p>
            <div className={`d-f gap-5px`}>
               <Input
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
                     { icon: "image", value: true, text: "Hi" },
                     { value: false, text: "Radial" },
                     { icon: "theme", value: false },
                  ]}
               />
            </div>
            {/* Parameters */}
            <div className={`d-f gap-5px`}>
               <Input
                  inputs={[
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
                        style: { width: 24 },
                     },
                  ]}
               />
               <Input
                  inputs={[
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
                        style: { width: 24 },
                     },
                  ]}
               />
               <Input
                  inputs={[
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
                        style: { width: 24 },
                     },
                  ]}
               />
            </div>
            {/* Submit */}
            <Input
               inputs={[
                  { value: grad.handles[2].blur, placeholder: "Blur in px", icon: "image", style: { width: 68 } },
                  { after: <span>%</span>, value: grad.handles[2].blur, placeholder: "Blur in px", style: { width: 22 } },
               ]}
            />
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
