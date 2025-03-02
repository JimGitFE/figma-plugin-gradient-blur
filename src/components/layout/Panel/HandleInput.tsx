/** Properties Panel Input sections */
// Dependencies
import React, { useEffect, useRef, useState } from "react"
// Components
import { useDrag } from "@/components/custom"
import { Inputs, InputButton } from "@/components/figma"
// Internal
import styles from "./properties.module.scss"

interface HandleProps extends React.HTMLAttributes<HTMLDivElement> {
   setGrad: any
   grad: any
   isDrag?: boolean
}

function HandleInput({ grad, setGrad, ...atts }: HandleProps) {
   const { onDragStart, isActive } = useDrag()
   const itemRef = useRef(null)
   const [isSelected, setIsSelected] = useState(false)

   useEffect(() => {
      if (isSelected) {
         const onClick = (e) => itemRef.current && !itemRef.current.contains(e.target) && setIsSelected(false)

         window.addEventListener("mousedown", onClick)
         return () => window.removeEventListener("mousedown", onClick)
      }
   }, [isSelected])

   useEffect(() => {
      if (isActive) setIsSelected(true)
   }, [isActive])

   return (
      <div {...atts} className={`${styles.item} d-f`} ref={itemRef}>
         {/* Handle */}
         <div onMouseDown={onDragStart} className={`${styles.handle} ${isSelected && styles.active} d-f jc-c pl-6px`}>
            <div className="icon icon--handle icon--white o-70" />
         </div>
         <Inputs
            inputs={[
               // blur value
               {
                  onChange: (e) => setGrad({ blur: Number(e.target.value) }),
                  value: grad.blur,
                  placeholder: "Blur in px",
                  icon: "tidy-up-grid",
               },
               // position
               {
                  onChange: (e) => setGrad({ pos: Number(e.target.value) }),
                  value: grad.pos,
                  placeholder: "Blur in px",
                  style: { width: 52, flex: 0 },
                  after: <span>%</span>,
               },
            ]}
         />
         <InputButton isActive={false} icon="minus" large />
      </div>
   )
}

export { HandleInput }
