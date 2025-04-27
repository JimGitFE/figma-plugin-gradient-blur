import React, { ComponentProps, forwardRef } from "react"

import numeric from "./numeric.module.css"
import styles from "./button.module.scss"
import { ToolTip } from "../ToolTip"

interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
   icon?: string
   text?: string
   isActive?: boolean
   disabled?: boolean
   large?: boolean
   ref?: React.MutableRefObject<HTMLButtonElement>
   tooltip?: Omit<ComponentProps<typeof ToolTip.Item>, "children">
   /** Short for text tooltip property */
   tip?: ComponentProps<typeof ToolTip.Item>["text"]
}

/** Individual for plural use */
const ActionButtonBase = forwardRef<HTMLButtonElement, ButtonProps>(
   ({ icon, text, isActive = false, large = false, tooltip, tip, ...atts }, ref) => {
      return (
         <ToolTip.Item {...(tooltip ?? { text: tip })} className={`fx-1`}>
            <button
               {...atts}
               ref={ref}
               className={`w-100 ${styles.input} ${large && styles.large} ${numeric.input} ${isActive && styles.active}`}
            >
               {icon && <div className={`${styles.icon} icon icon--${icon} icon--${isActive ? "blue" : "white"}`} />}
               {text && <span className="text type--small type--bold fw-500">{text}</span>}
            </button>
         </ToolTip.Item>
      )
   }
)

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
   children: Component<typeof ActionButtonBase>[] | Component<typeof ActionButtonBase>
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
