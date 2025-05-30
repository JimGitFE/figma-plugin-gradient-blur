import React, { useRef, InputHTMLAttributes, ReactNode } from "react"

import numeric from "./numeric.module.css"
import styles from "./input.module.scss"
import useDrag from "@/hooks/useDrag"
import { useCursor } from "@/hooks/useCursor"

type InputTypes = string | number

type Decorator = { icon?: string; child?: ReactNode } & React.HTMLAttributes<HTMLDivElement>

/** Single Input */
interface InputProps<V extends InputTypes> extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
   /** Input value display editor */
   state: {
      value: V
      onChange?: (newValue: V, originalEvent?: Partial<React.ChangeEvent<HTMLInputElement>>) => void
   } & (
      | {
           display?: (value: V) => string
           parse: (value: string) => V
        }
      // Default Number(string) will throw an error thus parse is required
      | {
           display?: (value: V) => number
           parse?: (value: string) => V
        }
   )
   /** Drag to resize input value */
   resize?: {
      strength?: number
      left?: boolean
      right?: boolean
      icon?: boolean
   }
   config?: {
      /** Icon Before <input */
      left?: Decorator
      /** Icon After <input */
      right?: Decorator
   } & React.InputHTMLAttributes<HTMLInputElement>
}

const DISPLAY = { display: (v) => String(v) } as InputProps<any>["state"]

/** Individual for plural use */
function InputAreaBase<V extends InputTypes>({ state = DISPLAY, resize, config = {}, ...atts }: InputProps<V>) {
   const defaultParse = ((d: string) => (typeof state.value === "number" ? Number(d) : d)) as (display: string) => V
   const [{ value, onChange, display, parse }, { left, right, ...inputAtts }] = [{ ...DISPLAY, parse: defaultParse, ...state }, config]
   const inputRef = useRef<HTMLInputElement>(null)
   const prevDxRef = useRef(0) // calculate diff

   /** Drag resize input value (trigger callback) */
   const move = () => {
      if (typeof value !== "number") return
      const newValue = (value + (dx - prevDxRef.current) * (resize?.strength ?? 0.5)) as V
      onChange(newValue, undefined)
      prevDxRef.current = dx // reset
   }

   const { dx, initDrag, isDragging } = useDrag<"x">({ callbacks: { move, up: () => (prevDxRef.current = 0) } })

   useCursor({ initialCursor: "ew-resize", setWhile: isDragging })

   /** Focus input if click coords outside input but inside container */
   const onDown = (e) => {
      if (inputRef.current && !inputRef.current?.contains(e.target as Node)) {
         e.preventDefault()
         inputRef.current?.focus()
      }
   }

   const iconClass = (icon: string) => icon && `icon icon--${icon} icon--white4 o-70`

   return (
      <div {...atts} className={`d-f ai-c pos-relative ${styles.input}`} onMouseDown={onDown}>
         <input
            {...inputAtts}
            ref={inputRef}
            className={`${styles.primitive} ${numeric.input}`}
            value={display(value)}
            onChange={(e) => onChange(parse(e.target.value), e)}
            type={"text"}
            disabled={inputAtts.disabled === true}
            tabIndex={0}
         />
         {left && (
            <div
               {...left}
               onMouseDown={(resize?.left ?? true) && initDrag}
               className={`${(resize?.left ?? true) && styles.resizer} ${styles.left} ${left.className} ${iconClass(left.icon)}`}
            >
               {left.child}
            </div>
         )}
         {right && (
            <div
               {...right}
               onMouseDown={(resize?.right ?? true) && initDrag}
               className={`${(resize?.right ?? true) && styles.resizer} ${styles.right} ${right.className} ${iconClass(right.icon)}`}
            >
               {right.child}
            </div>
         )}
      </div>
   )
}

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
   children: Component<typeof InputAreaBase>[] | Component<typeof InputAreaBase>
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
