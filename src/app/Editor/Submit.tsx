// Dependencies
import React from "react"
// Components
import { Button } from "@/components/figma"

export default function Submit() {
   const onCreate = () => {
      // const count = parseInt(textbox.current.value, 10)
      parent.postMessage({ pluginMessage: { type: "create", grad: "grad" } }, "*")
   }

   const onCancel = () => {
      parent.postMessage({ pluginMessage: { type: "cancel" } }, "*")
   }

   return (
      <>
         <section>
            <div className={`d-f jc-fe gap-8px`}>
               <Button onClick={onCancel} style={{ flex: 1.5 }} label="Cancel" secondary />
               <Button onClick={onCreate} style={{ flex: 2 }} label="Create" />
               {/* Create / Apply (existing frame) */}
            </div>
         </section>

         <hr />

         {/* Caption */}
         <section>
            <div className="d-f ai-c mt-4px gap-12px o-60 mw-100">
               {/* <div className="icon icon--warning icon--white8 o-80" /> */} {/* On Frame with children */}
               <div className="icon icon--resolve icon--white8 o-80" />
               <p>
                  <small>Insert Linear Gradient Blur into empty frame "Progressive".</small>
               </p>
            </div>
         </section>
      </>
   )
}
