/** Properties Panel Input sections */
// Dependencies
import React, { useEffect, useRef, useState } from "react"
// Components
import { useCustomDrag } from "@/components/custom"
import { InputContainer, InputAreaBase, ActionButton } from "@/components/figma"
// Internal
import styles from "./properties.module.scss"
import { useEventListener } from "@/hooks/useEventListener"
import { clamp } from "@/utils"
import { useCursor } from "@/hooks/useCursor"

interface HandleProps extends React.HTMLAttributes<HTMLDivElement> {
   setHandle: (handle: Partial<GradientStep>) => void
   handle: GradientStep
   isDrag?: boolean
}

function HandleInput({ handle, setHandle, ...atts }: HandleProps) {
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
         <InputContainer>
            <InputAreaBase
               value={handle.blur}
               display={(v) => Math.round(v)}
               onChange={(newVal) => setHandle({ blur: clamp(newVal, { min: 0 }) })}
               placeholder={"Blur in px"}
               icon={"tidy-up-grid"}
            />
            <InputAreaBase
               style={{ width: 52, flex: 0 }}
               value={handle.pos}
               display={(v) => Math.round(v)}
               onChange={(newVal) => setHandle({ pos: newVal })}
               resize={{ strength: 0.3 }}
               placeholder={"Blur in px"}
               after={<span>%</span>}
            />
         </InputContainer>
         <ActionButton isActive={false} icon="minus" large />
      </div>
   )
}

export { HandleInput }
