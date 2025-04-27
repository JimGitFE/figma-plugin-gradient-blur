// Dependencies
import React, { useEffect } from "react"
// Components
import { Theme } from "@/contexts/useTheme"
// Internal
import "@/styles/globals.scss" // Centralized
import * as Editor from "./Editor"

/** Main App ui entry point */
function Interface() {
   useEffect(() => {
      // This is how we read messages sent from the plugixn controller
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
            {/* Properties Editor Panel */}
            <Editor.Wrap className={`props-panel d-f fd-co bc-red pt-1rem pb-1rem c-white type--small type--medium type--inverse mw-200px`}>
               <Editor.Title />
               <hr />
               <Editor.Config />
               <hr />
               <Editor.Steps />
               <hr />
               <Editor.Submit />
            </Editor.Wrap>
            {/* Preview */}
            <div className="previewer bg-black w-100 o-60"></div>
         </div>
      </Theme>
   )
}

export default Interface
