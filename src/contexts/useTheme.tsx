import React from "react"
import styles from "@/styles/figma/tokens.module.css"

interface ThemeProps {
   theme?: string
   children: any
}

/** Sets theme context */
export function Theme({ theme = "dark", children }: ThemeProps) {
   return <div className={`plugin-container bg--figma-color-bg ${theme === "dark" ? styles.dark : styles.light}`}>{children}</div>
}
