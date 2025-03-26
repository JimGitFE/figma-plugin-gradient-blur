import React from "react"
import styles from "./menu.module.scss"

interface MenuProps extends React.HTMLAttributes<HTMLDivElement> {
   children: Component<typeof MenuItem>[] | React.ReactElement<"hr">
   positioned?: "right" | "left"
   isOpen?: boolean
}

function Menu({ isOpen = false, positioned = "right", ...atts }: MenuProps) {
   return isOpen && <div {...atts} className={`d-f fd-co ${styles.container} ${positioned} ${atts.className}`} />
}

interface ItemProps {
   title: string
   command?: string
   icon?: string
}

function MenuItem({ title, command, icon }: ItemProps) {
   return (
      <div className={`d-f jc-fs ai-c ${styles.item}`}>
         <div className={`icon-sm icon--${icon} icon--white`} style={{ opacity: icon ? 1 : 0 }} />
         <p className="fw-450">{title}</p> {/* fs- 12px white */}
         <div className={styles.shrinker} />
         <span className="fw-450 mr-4px">{command}</span>
         {/* TODO: Arrow if drop */}
      </div>
   )
}

export { Menu, MenuItem }
