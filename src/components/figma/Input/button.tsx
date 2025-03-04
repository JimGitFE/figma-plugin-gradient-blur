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

/** Individual */
function BtnSmBase({ icon, text, isActive = false, large = false, ...atts }: ButtonProps) {
   return (
      <button {...atts} className={`${styles.input} ${large && styles.large} ${numeric.input} ${isActive && styles.active}`}>
         {icon && <div className={`${styles.icon} icon icon--${icon} icon--${isActive ? "blue" : "white"}`} />}
         {text && <span className="text type--small type--bold fw-500">{text}</span>}
      </button>
   )
}

interface PluralProps extends React.HTMLAttributes<HTMLDivElement> {
   buttons: ButtonProps[]
}

function SmallButtons({ buttons, ...atts }: PluralProps) {
   return (
      <div {...atts} className={`${styles.textbox} d-f gap-1px`}>
         {buttons.map((props, i) => (
            <BtnSmBase key={i} {...props} />
         ))}
      </div>
   )
}

function SmallButton({ ...props }: ButtonProps) {
   return (
      <div className={`${styles.textbox} d-f gap-1px`}>
         <BtnSmBase {...props} />
      </div>
   )
}

export { SmallButtons, SmallButton }
