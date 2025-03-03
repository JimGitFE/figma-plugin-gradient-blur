import React, { useEffect, useRef } from "react"

import numeric from "./numeric.module.css"
import styles from "./input.module.scss"
import useDrag from "@/hooks/useDrag"

/** Single Input */
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
   icon?: string
   after?: any
   value: string | number
   onChange?: (e: Partial<React.ChangeEvent<HTMLInputElement>>) => void
   /** Input value display editor */
   display?: (value: string | number) => string
   /** Drag to resize input value */
   resize?: {
      strength?: number
      after?: boolean
      icon?: boolean
   }
   disabled?: boolean
}

function Base({ display = (v) => String(v), value, icon, onChange: onChange, disabled, resize, after, style, ...atts }: InputProps) {
   const inputRef = useRef<HTMLInputElement>(null)
   const prevDxRef = useRef(0) // calculate diff

   /** Drag resize input value  */
   const move = (e: MouseEvent) => {
      const fakeEvent = (value: any) => ({ target: { ...(e.target as HTMLInputElement), value: value.toString() } })
      const newValue = Number(value) + (dx - prevDxRef.current) * (resize?.strength ?? 0.5)
      prevDxRef.current = dx

      onChange(fakeEvent(newValue.toString()))
   }

   const { dx, onDragStart, isDragging } = useDrag({ callbacks: { move, up: () => (prevDxRef.current = 0) } })

   // TODO useCursor
   useEffect(() => {
      isDragging && document.body.classList.add("force-ew-resize")
      return () => {
         document.body.classList.remove("force-ew-resize")
      }
   }, [isDragging])

   return (
      <div
         style={style}
         className={`d-f ai-c pos-relative ${styles.input}`}
         onMouseDown={(e) => {
            // Focus if not already focusing (clicking on input) (makes text selectable)
            if (inputRef.current && !inputRef.current?.contains(e.target as Node)) {
               e.preventDefault()
               inputRef.current?.focus()
            }
         }}
      >
         <input
            {...atts}
            value={display(value)}
            ref={(ref) => (inputRef.current = ref)}
            type="text"
            disabled={disabled === true}
            tabIndex={0}
            onChange={(e) => onChange(e)}
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
         {after && (
            <div
               onMouseDown={(e) => {
                  onDragStart(e)
               }}
               className={`ml-6px ${styles.after}`}
            >
               {after}
            </div>
         )}
      </div>
   )
}

/** Multiple Inputs */
interface PluralProps extends React.HTMLAttributes<HTMLDivElement> {
   inputs: InputProps[]
}

function CombinedInputs({ inputs, ...atts }: PluralProps) {
   return (
      <div {...atts} className={`d-f ai-c gap-1px ${styles.textbox} textbox`}>
         {inputs.map((input, index) => (
            <Base key={index} {...input} />
         ))}
      </div>
   )
}

function Input({ ...props }: InputProps) {
   return (
      <div className={`d-f ai-c gap-1px ${styles.textbox} textbox`}>
         <Base {...props} />
      </div>
   )
}

export { CombinedInputs, Input }
