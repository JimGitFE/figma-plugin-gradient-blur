/** Properties Panel Input sections */
// Dependencies
import React, { useEffect, useRef, useState } from "react"
// Components
import { useCustomDrag } from "@/components/custom"
import { CombinedInputs, SmallButton } from "@/components/figma"
// Internal
import styles from "./properties.module.scss"
import { useEventListener } from "@/hooks/useEventListener"
import { clamp } from "@/utils"
import { useCursor } from "@/hooks/useCursor"

interface HandleProps extends React.HTMLAttributes<HTMLDivElement> {
   setGrad: any
   grad: any
   isDrag?: boolean
}

function HandleInput({ grad, setGrad, ...atts }: HandleProps) {
   const { onDragStart, isActive } = useCustomDrag()
   const itemRef = useRef(null)
   const [isSelected, setIsSelected] = useState(false)

   const onClickOut = (e: MouseEvent) => !itemRef.current?.contains(e.target) && setIsSelected(false)

   // prettier-ignore
   useEffect(() => {isActive && setIsSelected(true)}, [isActive])

   useEventListener("mousedown", onClickOut, { conditional: isSelected })

   useCursor({ initialCursor: "grabbing", setWhile: isActive })

   return (
      <div {...atts} className={`${styles.item} d-f`} ref={itemRef}>
         {/* Handle */}
         <div onMouseDown={onDragStart} className={`${styles.handle} ${isSelected && styles.active} d-f jc-c pl-6px`}>
            <div className="icon icon--handle icon--white o-70" />
         </div>
         <CombinedInputs
            inputs={[
               // blur value px
               {
                  onChange: (e) => setGrad({ blur: clamp(Number(e.target.value), { min: 0 }) }),
                  value: String(grad.blur),
                  display: (v) => `${Math.round(Number(v))}`,
                  placeholder: "Blur in px",
                  icon: "tidy-up-grid",
               },
               // position &
               {
                  onChange: (e) => setGrad({ pos: Number(e.target.value) }),
                  value: String(grad.pos),
                  display: (v) => `${Math.round(Number(v))}`,
                  resize: { strength: 0.3 },
                  placeholder: "Blur in px",
                  style: { width: 52, flex: 0 },
                  after: <span>%</span>,
               },
            ]}
         />
         <SmallButton isActive={false} icon="minus" large />
      </div>
   )
}

export { HandleInput }
