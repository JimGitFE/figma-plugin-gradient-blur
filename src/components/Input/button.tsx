import React from "react"

import numeric from "./numeric.module.css"
import styles from "./button.module.scss"

interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
   icon?: string
   text?: string
   value: boolean
   disabled?: boolean
}

interface Props {
   buttons: ButtonProps[]
   value?: string | number
}

export default function InputButton({ buttons, ...atts }: Props) {
   return (
      <div {...atts} className={`${styles.textbox} d-f gap-1px`}>
         {buttons.map(({ icon, text, value, ...atts }, i) => (
            <button {...atts} key={i} className={`${styles.input} ${numeric.input} ${value && styles.active}`}>
               {icon && <div className={`${styles.icon} icon icon--${icon} icon--${value ? "blue" : "white"}`} />}
               {text && <span className="text type--small type--bold fw-500">{text}</span>}
            </button>
         ))}
      </div>
   )
}
