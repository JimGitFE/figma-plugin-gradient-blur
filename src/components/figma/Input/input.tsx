import React, { useEffect, useRef } from "react"

import numeric from "./numeric.module.css"
import styles from "./input.module.scss"
import useDrag from "@/hooks/useDrag"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
   icon?: string
   disabled?: boolean
   value?: string | number
   after?: any
}
interface Props extends React.HTMLAttributes<HTMLDivElement> {
   inputs: InputProps[]
}

function Inputs({ inputs, ...atts }: Props) {
   const { dx, onDragStart, isDragging } = useDrag()
   const inputRefs = useRef<HTMLInputElement[]>([])

   console.log(dx)
   useEffect(() => {
      isDragging && document.body.classList.add("force-ew-resize")
      return () => {
         document.body.classList.remove("force-ew-resize")
      }
   }, [isDragging])

   return (
      <div {...atts} className={`d-f ai-c gap-1px ${styles.textbox} textbox`}>
         {inputs.map(({ icon, disabled = false, after, style, ...atts }, index) => (
            <div
               style={style}
               key={index}
               className={`d-f ai-c pos-relative ${styles.input}`}
               onMouseDown={(e) => {
                  e.preventDefault()
                  inputRefs.current[index]?.focus()
               }}
            >
               <input
                  {...atts}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  type="text"
                  disabled={disabled === true}
                  tabIndex={0}
                  className={`${styles.primitive} ${numeric.input}`}
               />
               {icon && (
                  <div
                     onMouseDown={(e) => {
                        onDragStart(e)
                     }}
                     className={`${styles.icon} icon icon--${icon} icon--white4 o-70`}
                  />
               )}
               {after && <div className={`ml-6px ${styles.after}`}>{after}</div>}
            </div>
         ))}
      </div>
   )
}

function Input({ ...atts }: InputProps) {
   return <Inputs inputs={[{ ...atts }]} />
}

export { Inputs, Input }
