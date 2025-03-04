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

/** Individual for plural use */
function ActionButtonBase({ icon, text, isActive = false, large = false, ...atts }: ButtonProps) {
   return (
      <button {...atts} className={`${styles.input} ${large && styles.large} ${numeric.input} ${isActive && styles.active}`}>
         {icon && <div className={`${styles.icon} icon icon--${icon} icon--${isActive ? "blue" : "white"}`} />}
         {text && <span className="text type--small type--bold fw-500">{text}</span>}
      </button>
   )
}

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
   children: React.ReactElement<typeof ActionButtonBase>[] | React.ReactElement<typeof ActionButtonBase>
}

function ActionContainer({ ...atts }: ContainerProps) {
   return <div {...atts} className={`${styles.textbox} d-f gap-1px`} />
}

function ActionButton({ ...props }: ButtonProps) {
   return (
      <ActionContainer>
         <ActionButtonBase {...props} />
      </ActionContainer>
   )
}

export { ActionContainer, ActionButtonBase, ActionButton }
