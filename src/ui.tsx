import React, { useEffect } from "react"
import "./styles/globals.scss" // Import your CSS file

import { Theme } from "@/contexts/useTheme"
import { PropertiesPanel } from "@/components/layout"

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
            <PropertiesPanel
               className={`props-panel d-f fd-co bc-red pt-1rem pb-1rem c-white type--small type--medium type--inverse mw-200px`}
            />
            <div className="previewer bg-black w-100 o-60"></div>
         </div>
      </Theme>
   )
}

export default Interface
