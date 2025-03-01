import React from "react"

import numeric from "./numeric.module.css"
import styles from "./input.module.scss"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
   icon?: string
   disabled?: boolean
   value?: string | number
   after?: any
}
interface Props {
   inputs: InputProps[]
}

export default function Input({ inputs }: Props) {
   return (
      <div className={`d-f ai-c gap-2px ${styles.textbox}`}>
         {inputs.map(({ icon, disabled = false, after, ...atts }, index) => (
            <div key={index} className={`d-f ai-c pos-relative ${styles.input}`}>
               <input {...atts} type="text" disabled={disabled === true} tabIndex={0} className={`${styles.primitive} ${numeric.input}`} />
               {icon && <div className={`${styles.icon} icon icon--${icon} icon--white4 o-70`} />}
               {after && <div className={`ml-6px ${styles.after}`}>{after}</div>}
            </div>
         ))}
      </div>
   )
}
