import React from "react"

import styles from "./button.module.css"

export interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
   children: React.ReactNode
   danger?: boolean
   disabled?: boolean
   fullWidth?: boolean
   loading?: boolean
   //   onClick?: EventHandler.onClick<HTMLButtonElement>
   secondary?: boolean
}

export default function Button({
   children,
   danger = false,
   disabled = false,
   fullWidth = false,
   loading = false,
   secondary = false,
   ...atts
}: ButtonProps) {
   return (
      <div
         className={`${styles.button} ${secondary ? styles.secondary : styles.default}`}
         //  class={createClassName([
         //     styles.button,
         //     secondary === true ? styles.secondary : styles.default,
         //     danger === true ? styles.danger : null,
         //     fullWidth === true ? styles.fullWidth : null,
         //     disabled === true ? styles.disabled : null,
         //     loading === true ? styles.loading : null,
         //  ])}
      >
         <button
            {...atts}
            // ref={ref}
            disabled={disabled === true}
            // onClick={loading === true ? undefined : onClick}
            // onKeyDown={handleKeyDown}
            tabIndex={0}
         >
            <div className={styles.children}>{children}</div>
         </button>
         {/* {loading === true ? (
            <div class={styles.loadingIndicator}>
               <LoadingIndicator />
            </div>
         ) : null} */}
      </div>
   )
}
