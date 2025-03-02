import React from "react"

import numeric from "./numeric.module.css"
import styles from "./button.module.scss"

interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
   icon?: string
   text?: string
   isActive?: boolean
   disabled?: boolean
   large?: boolean
}

interface Props extends React.HTMLAttributes<HTMLDivElement> {
   buttons: ButtonProps[]
   // value?: string | number
}

function InputButtons({ buttons, ...atts }: Props) {
   return (
      <div {...atts} className={`${styles.textbox} d-f gap-1px`}>
         {buttons.map(({ icon, text, isActive = false, large = false, ...atts }, i) => (
            <button {...atts} key={i} className={`${styles.input} ${large && styles.large} ${numeric.input} ${isActive && styles.active}`}>
               {icon && <div className={`${styles.icon} icon icon--${icon} icon--${isActive ? "blue" : "white"}`} />}
               {text && <span className="text type--small type--bold fw-500">{text}</span>}
            </button>
         ))}
      </div>
   )
}

/** Individual */
function InputButton({ ...atts }: ButtonProps) {
   return <InputButtons buttons={[{ ...atts }]} />
}

export { InputButtons, InputButton }
