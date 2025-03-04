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
import { useProperties } from "@/store"
import { useShallow } from "zustand/shallow"

/** Store Hook */
const useHandle = (handleIndex: number) => {
   const [handle, updateHandle] = useProperties(useShallow((state) => [state.grad.handles[handleIndex], state.updateHandle]))
   return [handle, (patch: Partial<GradientStep>) => updateHandle(handleIndex, patch)] as const
}

interface HandleProps extends React.HTMLAttributes<HTMLDivElement> {
   handleIndex: number
}

function HandleInput({ handleIndex, ...atts }: HandleProps) {
   const [handle, setHandle] = useHandle(handleIndex)
   const { onDragStart, isActive } = useCustomDrag()
   useCursor({ initialCursor: "grabbing", setWhile: isActive })

   /* Item Selection */
   const itemRef = useRef(null)
   const [isSelected, setIsSelected] = useState(false)
   const onClickOut = (e: MouseEvent) => !itemRef.current?.contains(e.target) && setIsSelected(false)
   // prettier-ignore
   useEffect(() => {isActive && setIsSelected(true)}, [isActive])
   useEventListener("mousedown", onClickOut, { conditional: isSelected })

   return (
      <div {...atts} className={`${styles.item} d-f`} ref={itemRef}>
         {/* Handle */}
         <div onMouseDown={onDragStart} className={`${styles.handle} ${isSelected && styles.active} d-f jc-c pl-6px`}>
            <div className="icon icon--handle icon--white o-70" />
         </div>
         <InputContainer>
            <InputAreaBase
               state={{
                  value: handle.blur,
                  display: (v) => Math.round(v),
                  onChange: (newVal) => setHandle({ blur: clamp(newVal, { min: 0 }) }),
               }}
               placeholder={"Blur in px"}
               icon={"tidy-up-grid"}
            />
            <InputAreaBase
               style={{ width: 52, flex: 0 }}
               state={{
                  value: handle.pos,
                  display: (v) => Math.round(v),
                  onChange: (newVal) => setHandle({ pos: newVal }),
               }}
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
