import React, { useEffect, useRef, useCallback } from "react"
import "./styles/utilities.css" // Import your CSS file

function Interface() {
   const textbox = useRef<HTMLInputElement>(undefined)

   const countRef = useCallback((element: HTMLInputElement) => {
      if (element) element.value = "5"
      textbox.current = element
   }, [])

   const onCreate = () => {
      const count = parseInt(textbox.current.value, 10)
      parent.postMessage({ pluginMessage: { type: "create-rectangles", count } }, "*")
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
      <div className="d-f fd-co">
         {/* <img src={logo} /> */}
         <h2>Rectangle Creator</h2>
         <p className="p-small">
            Count: <input ref={countRef} />
         </p>
         <button className="p-8px button button--primary" id="create" onClick={onCreate}>
            Create
         </button>
         <button onClick={onCancel}>Cancel</button>
      </div>
   )
}

export default Interface
