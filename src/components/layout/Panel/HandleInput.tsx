/** Properties Panel Input sections */
// Dependencies
import React, { useEffect, useRef, useState } from "react"
import { useShallow } from "zustand/shallow"
// Components
import { Reorder } from "@/components/custom"
import { InputContainer, InputAreaBase, ActionButton } from "@/components/figma"
import { useEventListener } from "@/hooks/useEventListener"
import { useCursor } from "@/hooks/useCursor"
import { useProperties } from "@/store"
import { clamp } from "@/utils"
// Internal
import styles from "./handles.module.scss"

interface HandleProps extends React.HTMLAttributes<HTMLDivElement> {
   handleId: number
   handle: GradientStep
}

function HandleInput({ handle, handleId, ...atts }: HandleProps) {
   const [update, destroy] = useHandle(handleId) // store hook

   // Drag resize input
   const { onDragStart, isActive } = Reorder.useDragHandle()
   useCursor({ initialCursor: "grabbing", setWhile: isActive })

   /* Item Selection */
   const itemRef = useRef(null)
   const [isSelected, setIsSelected] = useState(false)
   const onClickOut = (e: EventFor<MouseEvent>) => !itemRef.current?.contains(e.target) && setIsSelected(false)
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
                  onChange: (newVal) => update({ blur: clamp(newVal, { min: 0 }) }),
               }}
               config={{
                  placeholder: "Blur in px",
                  left: { icon: "tidy-up-grid" },
               }}
            />
            <InputAreaBase
               style={{ width: 52, flex: 0 }}
               state={{
                  value: handle.pos,
                  display: (v) => Math.round(v),
                  onChange: (n) => update({ pos: n }),
               }}
               resize={{ strength: 0.3 }}
               config={{
                  placeholder: "Blur in px",
                  right: { child: <span className="ml-2px">%</span> },
               }}
            />
         </InputContainer>
         <ActionButton onClick={destroy} isActive={false} icon="minus" large />
      </div>
   )
}

// Helpers

/** Store Hook */
const useHandle = (handleId: number) => {
   const { updateHandle, removeHandle, sortHandles } = useProperties(useShallow((state) => state))
   const update = (patch: Partial<GradientStep>) => {
      updateHandle(handleId, patch)
      sortHandles()
   }
   const remove = () => removeHandle(handleId)
   return [update, remove] as const
}

export { HandleInput }
