import React, { useRef, InputHTMLAttributes } from "react"

import numeric from "./numeric.module.css"
import styles from "./input.module.scss"
import useDrag from "@/hooks/useDrag"
import { useCursor } from "@/hooks/useCursor"

type InputTypes = string | number

/** Single Input */
interface InputProps<V extends InputTypes, D extends InputTypes = string>
   extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
   icon?: string
   after?: any
   value: V
   /** Input value display editor */
   // Display value
   display?: (value: V) => D
   parse?: (value: D) => V

   onChange?: (newValue: V, originalEvent?: Partial<React.ChangeEvent<HTMLInputElement>>) => void
   /** Drag to resize input value */
   resize?: {
      strength?: number
      after?: boolean
      icon?: boolean
   }
   disabled?: boolean
}

/** Individual for plural use */
function InputAreaBase<V extends InputTypes, D extends InputTypes = string>({
   value,
   display = (v) => (typeof v === "number" ? Number(v) : String(v)) as D,
   parse = (v) => (typeof v === "number" ? Number(v) : String(v)) as V,
   onChange = console.log,
   resize,
   icon,
   after,
   disabled,
   ...atts
}: InputProps<V, D>) {
   const inputRef = useRef<HTMLInputElement>(null)
   const prevDxRef = useRef(0) // calculate diff
   const displayValue = display ? display(value) : value

   /** Drag resize input value (trigger callback) */
   const move = () => {
      if (typeof value !== "number") return
      const newValue = (value + (dx - prevDxRef.current) * (resize?.strength ?? 0.5)) as V
      onChange(newValue, undefined)
      prevDxRef.current = dx // reset
   }

   const { dx, onDragStart, isDragging } = useDrag({ callbacks: { move, up: () => (prevDxRef.current = 0) } })

   useCursor({ initialCursor: "ew-resize", setWhile: isDragging })

   return (
      <div
         {...atts}
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
            value={displayValue}
            ref={(ref) => (inputRef.current = ref)}
            type={typeof displayValue === "number" ? "number" : "text"}
            disabled={disabled === true}
            tabIndex={0}
            onChange={(e) => onChange(parse(e.target.value as D), e)}
            className={`${styles.primitive} ${numeric.input}`}
         />
         {icon && (
            <div
               onMouseDown={onDragStart}
               className={`${styles.icon} ${(resize?.after ?? true) && styles.resizer} icon icon--${icon} icon--white4 o-70`}
            />
         )}
         {after && (
            <div onMouseDown={onDragStart} className={`ml-6px ${styles.after} ${(resize?.after ?? true) && styles.resizer}`}>
               {after}
            </div>
         )}
      </div>
   )
}

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
   children: React.ReactElement<typeof InputAreaBase>[] | React.ReactElement<typeof InputAreaBase>
}

function InputContainer({ ...atts }: ContainerProps) {
   return <div {...atts} className={`d-f ai-c gap-1px ${styles.textbox} textbox`} />
}

function InputArea<V extends InputTypes, D extends InputTypes = string>({ ...props }: InputProps<V, D>) {
   return (
      <InputContainer>
         <InputAreaBase {...props} />
      </InputContainer>
   )
}

export { InputContainer, InputAreaBase, InputArea }
