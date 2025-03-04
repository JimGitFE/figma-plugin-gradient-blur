import React, { useRef, InputHTMLAttributes } from "react"

import numeric from "./numeric.module.css"
import styles from "./input.module.scss"
import useDrag from "@/hooks/useDrag"
import { useCursor } from "@/hooks/useCursor"

type InputTypes = string | number

/** Single Input */
interface InputProps<V extends InputTypes> extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
   icon?: string
   after?: any
   /** Input value display editor */
   state: {
      value: V
      display?: (value: V) => InputTypes
      parse?: (value: string) => V
      onChange?: (newValue: V, originalEvent?: Partial<React.ChangeEvent<HTMLInputElement>>) => void
   }
   /** Drag to resize input value */
   resize?: {
      strength?: number
      after?: boolean
      icon?: boolean
   }
   disabled?: boolean
}

const DISPLAY = {
   display: (v) => String(v),
   parse: (d) => {
      console.log(d)
      return typeof d === "number" ? Number(d) : d
   },
} as InputProps<any>["state"]

/** Individual for plural use */
function InputAreaBase<V extends InputTypes>({ state = DISPLAY, resize, icon, after, disabled, ...atts }: InputProps<V>) {
   const { value, onChange, display, parse } = state
   const inputRef = useRef<HTMLInputElement>(null)
   const prevDxRef = useRef(0) // calculate diff

   /** Drag resize input value (trigger callback) */
   const move = () => {
      if (typeof value !== "number") return
      const newValue = (value + (dx - prevDxRef.current) * (resize?.strength ?? 0.5)) as V
      onChange(newValue, undefined)
      prevDxRef.current = dx // reset
   }

   const { dx, onDragStart, isDragging } = useDrag({ callbacks: { move, up: () => (prevDxRef.current = 0) } })

   useCursor({ initialCursor: "ew-resize", setWhile: isDragging })

   /** Focus input if click coords outside input but inside container */
   const onDown = (target: Node) => inputRef.current && !inputRef.current?.contains(target) && inputRef.current?.focus()

   return (
      <div {...atts} className={`d-f ai-c pos-relative ${styles.input}`} onMouseDown={(e) => onDown(e.target as Node)}>
         <input
            ref={inputRef}
            className={`${styles.primitive} ${numeric.input}`}
            value={String(display(value))}
            onChange={(e) => onChange(parse(e.target.value), e)}
            type={"text"}
            disabled={disabled === true}
            tabIndex={0}
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

function InputArea<V extends InputTypes>({ ...props }: InputProps<V>) {
   return (
      <InputContainer>
         <InputAreaBase {...props} />
      </InputContainer>
   )
}

export { InputContainer, InputAreaBase, InputArea }
