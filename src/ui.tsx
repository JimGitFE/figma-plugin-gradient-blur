import React, { useEffect } from "react"
import "./styles/globals.scss" // Import your CSS file
// import "./styles/utilities.css" // Import your CSS file

import Button from "@/components/Button"
import Theme from "./components/Theme"
import useDynamicState from "./hooks/useDynamicState"
import Input from "./components/Input/input"
import InputButton from "./components/Input/button"
import { Reorderable, useDrag } from "./components/Draggable"

const DEFAULT_RESOLUTION = 5
const DEFAULT_HANDLES = [
   { pos: 0, blur: 10 },
   { pos: 75, blur: 4 },
   { pos: 100, blur: 0 },
]

interface HandleProps {
   setGrad: any
   grad: any
   isDrag?: boolean
}

function HandleRow({ grad, setGrad }: HandleProps) {
   const { onDragStart } = useDrag()

   return (
      <div
         className="handle d-f gap-6px pt-3px pb-3px"
         style={{
            marginRight: "-1.2rem",
            marginLeft: "-1.2rem",
            paddingLeft: "1.2rem",
            paddingRight: "1.2rem",
         }}
      >
         {/* Handle */}
         <div
            onMouseDown={onDragStart}
            style={{
               marginLeft: "-1.2rem",
               width: "calc(1.2rem - 6px)",
            }}
            className={`drag-handle d-f jc-c pl-6px`}
         >
            <div className="icon icon--handle icon--white o-70" />
         </div>
         <Input
            inputs={[
               // blur value
               {
                  onChange: setGrad,
                  value: grad.blur,
                  placeholder: "Blur in px",
                  icon: "tidy-up-grid",
               },
               // position
               {
                  after: <span>%</span>,
                  value: grad.pos,
                  placeholder: "Blur in px",
                  style: { width: 52, flex: 0 },
               },
            ]}
         />
         <InputButton buttons={[{ value: false, icon: "minus", large: true }]} />
      </div>
   )
}

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

   const onHandleChange = (e, rowIndex) => {
      setGrad("handles", (prev) => {
         return prev.map((item, index) => {
            if (index === rowIndex) {
               // Update the condition to match the specific object you want to update
               return { ...item, blur: Number((e.target as HTMLInputElement).value) }
            }
            return item
         })
      })
   }

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
                     <p className="p-small type--inverse fw-500">Resolution / Type</p>
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
                  <div className={`d-f fd-co gap-6px`} style={{ marginTop: -3, marginBottom: -3 }}>
                     <Reorderable onReorder={(newSource) => setGrad("handles", newSource)} sources={grad.handles}>
                        {grad.handles.map((_, index) => (
                           <HandleRow grad={grad.handles[index]} setGrad={(e) => onHandleChange(e, index)} />
                        ))}
                     </Reorderable>
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
