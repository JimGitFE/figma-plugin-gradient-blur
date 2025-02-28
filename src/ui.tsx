import React, { useEffect, useRef, useCallback } from "react"
import "./styles/globals.scss" // Import your CSS file
// import "./styles/utilities.css" // Import your CSS file

import Button from "@/components/Button"
import Theme from "./components/Theme"

function Interface() {
   const textbox = useRef<HTMLInputElement>(undefined)

   const countRef = useCallback((element: HTMLInputElement) => {
      if (element) element.value = "5"
      textbox.current = element
   }, [])

   const onCreate = () => {
      // const count = parseInt(textbox.current.value, 10)
      // parent.postMessage({ pluginMessage: { type: "create-rectangles", count } }, "*")
      console.log("aa")
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
         <div className={`d-f fd-co type--small type--medium type--inverse`}>
            {/* <img src={logo} /> */}
            <h2>Rectangle Creator</h2>
            <p className="p-small type--inverse">
               Count: <input ref={countRef} />
            </p>
            <div className="input">
               <input type="input" className="input__field" placeholder="Placeholder" />
            </div>
            <div className="radio">
               <input id="radioButton2" type="radio" className="radio__button" value="Value" name="radioGroup" checked />
               <label htmlFor="radioButton2" className="radio__label">
                  Radio button
               </label>
            </div>
            <div className="button default">
               <button className="p-8px button--primary" id="create" onClick={onCreate}>
                  Create
               </button>
            </div>
            <div className={`d-f gap-8px`}>
               <Button secondary>Cancel</Button>
               <Button>Create</Button>
            </div>
            <div className="onboarding-tip">
               <div className="icon icon--styles"></div>
               <div className="onboarding-tip__msg">Onboarding tip goes here.</div>
            </div>
            <button onClick={onCancel}>Cancel</button>
         </div>
      </Theme>
   )
}

export default Interface
