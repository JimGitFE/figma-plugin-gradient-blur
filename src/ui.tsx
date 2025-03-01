import React, { useEffect, useRef, useCallback } from "react"
import "./styles/globals.scss" // Import your CSS file
// import "./styles/utilities.css" // Import your CSS file

import Button from "@/components/Button"
import Theme from "./components/Theme"
import useDynamicState from "./hooks/useDynamicState"

const DEFAULT_RESOLUTION = 5
const DEFAULT_HANDLES = [
   { pos: 0, blur: 10 },
   { pos: 100, blur: 0 },
]

function Interface() {
   const [grad, setGrad] = useDynamicState({ resolution: DEFAULT_RESOLUTION, handles: DEFAULT_HANDLES })
   const textbox = useRef<HTMLInputElement>(undefined)

   const countRef = useCallback((element: HTMLInputElement) => {
      if (element) element.value = "5"
      textbox.current = element
   }, [])

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
         <section className={`d-f fd-co c-white type--small type--medium type--inverse`}>
            {/* <img src={logo} /> */}
            <h2>Rectangle Creator</h2>
            {/* Resolution */}
            <p className="p-small type--inverse">
               Resolution: <input ref={countRef} />
            </p>
            {/* Parameters */}
            <div className="input d-f">
               <input
                  onChange={(e) => setGrad("resolution", Number((e.target as HTMLInputElement).value))}
                  value={grad.resolution}
                  type="input"
                  className="bg-black c-white"
                  placeholder="Blur in px"
               />
               <input type="input" className="bg-black c-white" placeholder="Blur in px" />
               <input type="input" className="bg-black c-white" placeholder="Blur in px" />
            </div>
            {/* Submit */}
            <div className={`d-f gap-8px`}>
               <Button className="w-80px" onClick={onCreate}>
                  Create
               </Button>
               <Button onClick={onCancel} secondary>
                  Cancel
               </Button>
            </div>
            <div className="onboarding-tip">
               <div className="icon icon--styles"></div>
               <div className="onboarding-tip__msg">Onboarding tip goes here.</div>
            </div>
         </section>
      </Theme>
   )
}

export default Interface
