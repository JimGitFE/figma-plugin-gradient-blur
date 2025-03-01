import React, { useRef } from "react"

import numeric from "./numeric.module.css"
import styles from "./input.module.scss"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
   icon?: string
   disabled?: boolean
   value?: string | number
   after?: any
}
interface Props extends React.HTMLAttributes<HTMLDivElement> {
   inputs: InputProps[]
}

export default function Input({ inputs, ...atts }: Props) {
   const inputRefs = useRef<HTMLInputElement[]>([])
   return (
      <div {...atts} className={`d-f ai-c gap-1px ${styles.textbox}`}>
         {inputs.map(({ icon, disabled = false, after, style, ...atts }, index) => (
            <div
               style={style}
               key={index}
               className={`d-f ai-c pos-relative ${styles.input}`}
               onClick={() => inputRefs.current[index]?.focus()}
            >
               <input
                  {...atts}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  type="text"
                  disabled={disabled === true}
                  tabIndex={0}
                  className={`${styles.primitive} ${numeric.input}`}
               />
               {icon && <div className={`${styles.icon} icon icon--${icon} icon--white4 o-70`} />}
               {after && <div className={`ml-6px ${styles.after}`}>{after}</div>}
            </div>
         ))}
      </div>
   )
}
