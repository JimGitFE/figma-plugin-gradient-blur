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
   const sortHandles = useProperties((state) => state.sortHandles)
   const setHandle = useHandle(handleId) // store hook

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

   /** On position input change */
   const posChange = (newPos: number) => {
      setHandle({ pos: newPos })
      sortHandles()
   }

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
                  onChange: posChange,
               }}
               resize={{ strength: 0.3 }}
               config={{
                  placeholder: "Blur in px",
                  right: { child: <span className="ml-2px">%</span> },
               }}
            />
         </InputContainer>
         <ActionButton isActive={false} icon="minus" large />
      </div>
   )
}

// Helpers

/** Store Hook */
const useHandle = (handleId: number) => {
   const updateHandle = useProperties(useShallow((state) => state.updateHandle))
   return (patch: Partial<GradientStep>) => updateHandle(handleId, patch)
}

export { HandleInput }
