import React, { useRef, InputHTMLAttributes } from "react"

import numeric from "./numeric.module.css"
import styles from "./input.module.scss"
import useDrag from "@/hooks/useDrag"
import { useCursor } from "@/hooks/useCursor"

type InputTypes = string | number

/** Single Input */
interface InputProps<V extends InputTypes, D extends InputTypes> extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
   icon?: string
   after?: any
   value: V
   /** Input value display editor */
   display: (value: V) => D
   onChange?: (newValue: D, originalEvent?: Partial<React.ChangeEvent<HTMLInputElement>>) => void
   /** Drag to resize input value */
   resize?: {
      strength?: number
      after?: boolean
      icon?: boolean
   }
   disabled?: boolean
}

function Base<V extends InputTypes, D extends number | string>({
   value,
   display,
   icon,
   onChange,
   disabled,
   resize,
   after,
   style,
   ...atts
}: InputProps<V, D>) {
   const inputRef = useRef<HTMLInputElement>(null)
   const prevDxRef = useRef(0) // calculate diff
   const displayValue = display ? display(value) : value

   /** Drag resize input value (trigger callback) */
   const move = () => {
      if (typeof display(value) !== "number") return
      const newValue = (Number(value) + (dx - prevDxRef.current) * (resize?.strength ?? 0.5)) as D
      onChange && onChange(newValue, undefined)
      prevDxRef.current = dx
   }

   const { dx, onDragStart, isDragging } = useDrag({ callbacks: { move, up: () => (prevDxRef.current = 0) } })

   useCursor({ initialCursor: "ew-resize", setWhile: isDragging })

   /** Safely Guarded onChange callback */
   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = (typeof displayValue === "number" ? Number(e.target.value) : e.target.value) as D
      onChange && onChange(newValue, e)
   }

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
            value={displayValue}
            ref={(ref) => (inputRef.current = ref)}
            type={typeof displayValue === "number" ? "number" : "text"}
            disabled={disabled === true}
            tabIndex={0}
            onChange={handleChange}
            className={`${styles.primitive} ${numeric.input}`}
         />
         {icon && (
            <div
               onMouseDown={(e) => {
                  onDragStart(e)
               }}
               className={`${styles.icon} ${(resize?.after ?? true) && styles.resizer} icon icon--${icon} icon--white4 o-70`}
            />
         )}
         {after && (
            <div
               onMouseDown={(e) => {
                  onDragStart(e)
               }}
               className={`ml-6px ${styles.after} ${(resize?.after ?? true) && styles.resizer}`}
            >
               {after}
            </div>
         )}
      </div>
   )
}

/** Multiple Inputs */
interface PluralProps<V extends InputTypes, D extends InputTypes> extends React.HTMLAttributes<HTMLDivElement> {
   inputs: InputProps<V, D>[] // expected to be homogeneous—all items are of the same type !TODO: use Container and Base[] as children
}

function CombinedInputs<V extends InputTypes, D extends InputTypes>({ inputs, ...atts }: PluralProps<V, D>) {
   return (
      <div {...atts} className={`d-f ai-c gap-1px ${styles.textbox} textbox`}>
         {inputs.map((input, index) => (
            <Base key={index} {...input} />
         ))}
      </div>
   )
}

function Input<V extends InputTypes, R extends number | string>({ ...props }: InputProps<V, R>) {
   return (
      <div className={`d-f ai-c gap-1px ${styles.textbox} textbox`}>
         <Base {...props} />
      </div>
   )
}

export { CombinedInputs, Input }
