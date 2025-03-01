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
         <div className="d-f">
            {/* Properties panel */}
            <div className={`props-panel d-f fd-co gap-6px bc-red pt-1rem pb-1rem c-white type--small type--medium type--inverse mw-200px`}>
               <section>
                  {/* Title */}
                  <div className="d-f ai-c jc-sb">
                     {/* Plugin Icon & Menu title */}
                     <div className="d-f">
                        {/* <img src={logo} /> */}
                        <h3 className={`fs-14px fw-550`}>Properties Panel</h3>
                     </div>
                     {/* Buttons */}
                     <div>
                        <InputButton buttons={[{ value: false, icon: "ellipses", large: true }]} />
                     </div>
                  </div>
               </section>

               <hr className="mt-8px" />

               <section>
                  {/* Title */}
                  <div className="d-f jc-sb ai-c h-30px">
                     <p className="p-small type--inverse fw-500">Resolution</p>
                     <InputButton buttons={[{ value: false, icon: "info", large: true }]} />
                  </div>

                  {/* Gradient Type */}
                  <div className={`d-f gap-5px`}>
                     <InputButton
                        style={{ width: "auto", flex: 1 }}
                        buttons={[
                           { value: true, text: "Linear" },
                           { value: false, text: "Radial" },
                        ]}
                     />
                  </div>

                  {/* Resolution & Angle */}
                  <div className={`d-f gap-5px`}>
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
               </section>

               <hr className="mt-8px" />

               {/* Parameters */}
               <section>
                  {/* Title */}
                  <div className="d-f jc-sb ai-c h-30px">
                     <p className="p-small type--inverse fw-500" style={{ flex: 1 }}>
                        Gradient Handles
                     </p>
                     <InputButton buttons={[{ value: false, icon: "swap", large: true }]} />
                     <InputButton buttons={[{ value: false, icon: "plus", large: true }]} />
                  </div>

                  {/* Inputs Handles */}
                  <div className={`d-f fd-co gap-6px`}>
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
                                 icon: "tidy-up-grid",
                              },
                              // position
                              {
                                 after: <span>%</span>,
                                 value: grad.handles[2].blur,
                                 placeholder: "Blur in px",
                                 style: { width: 52, flex: 0 },
                              },
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
                                 icon: "tidy-up-grid",
                              },
                              // position
                              {
                                 after: <span>%</span>,
                                 value: grad.handles[2].blur,
                                 placeholder: "Blur in px",
                                 style: { width: 52, flex: 0 },
                              },
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
                                 icon: "tidy-up-grid",
                              },
                              // position
                              {
                                 after: <span>%</span>,
                                 value: grad.handles[2].blur,
                                 placeholder: "Blur in px",
                                 style: { width: 52, flex: 0 },
                              },
                           ]}
                        />
                        <InputButton buttons={[{ value: false, icon: "minus", large: true }]} />
                     </div>
                  </div>
               </section>

               <hr className="mt-8px" />
               {/* Submit */}
               <section>
                  <div className={`d-f jc-fe gap-8px mt-8px`}>
                     <Button onClick={onCancel} style={{ flex: 1.5 }} secondary>
                        Cancel
                     </Button>
                     <Button style={{ flex: 2 }} onClick={onCreate}>
                        Create
                     </Button>
                  </div>
               </section>

               <hr className="mt-8px" />

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
            <div className="previewer bg-black w-100 o-60"></div>
         </div>
      </Theme>
   )
}

export default Interface
