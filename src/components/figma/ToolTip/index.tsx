import React, { useLayoutEffect, useRef, useState } from "react"
import { DelayedUnmount } from "@/components/custom"
import styles from "./tool-tip.module.scss"

/** Delayed unmount transition */
const transition: [React.CSSProperties, React.CSSProperties] = [
   { opacity: 0, transform: "translateY(4px)" },
   { opacity: 1, transform: "translateY(0)" },
]

interface TipProps extends React.HTMLAttributes<HTMLDivElement> {
   children: React.ReactNode
   text?: string
   /** Allignment X */
   allign?: "left" | "right" | "auto"
   /** Render when true */
   conditional?: boolean
   /** Container Ref */
   containerRef?: React.MutableRefObject<HTMLDivElement>
}

/** Wrapper */
function ToolTip({ text, allign = "auto", conditional = true, containerRef, children, ...atts }: TipProps) {
   const [isOpen, setIsOpen] = useState(false)
   const wrapRef = useRef<HTMLDivElement>(null) // dimensions
   const [allignmentX, setAllignmentX] = useState<"left" | "right" | "auto">(allign)
   const [allignmentY, setAllignmentY] = useState<"top" | "bottom">("bottom")

   /* Dynamic allignment */
   useLayoutEffect(() => {
      if (wrapRef.current) {
         const { width, height, left, right, bottom } = wrapRef.current.getBoundingClientRect() // button

         wrapRef.current.style.setProperty("--wrap-width", `${width}px`)
         wrapRef.current.style.setProperty("--wrap-height", `${height}px`)
         wrapRef.current.style.setProperty("--wrap-left", `${left}px`)
         wrapRef.current.style.setProperty("--wrap-right", `${right}px`)

         /* Dynamic allignment on window overflow */

         const tip = { width: 150, height: 24 + 3 }
         const container = containerRef?.current?.getBoundingClientRect()
         const viewport = {
            width: container?.width ?? window.innerWidth,
            height: container?.height ?? window.innerHeight,
            left: container?.left ?? 0,
            right: container?.right ?? window.innerWidth,
         }

         console.log(viewport, text)
         wrapRef.current.style.setProperty("--cont-width", `${viewport.width}px`)
         wrapRef.current.style.setProperty("--cont-left", `${viewport.left}px`)
         wrapRef.current.style.setProperty("--cont-right", `${viewport.right}px`)

         // Horizontal Axis
         if (allign === "auto") {
            if (right + tip.width / 2 > viewport.width) {
               setAllignmentX("right")
            } else if (left - tip.width / 2 < 0) {
               setAllignmentX("left")
            }
         }

         // Vertical Axis
         if (bottom + tip.height + 12 > viewport.height) setAllignmentY("top")
      }
   }, [wrapRef.current, containerRef])

   return (
      <div {...atts} ref={wrapRef} className={`pos-relative ${styles.wrap} ${atts.className}`}>
         {/* Item */}
         <div
            onMouseEnter={() => !isOpen && setIsOpen(true)}
            onMouseLeave={() => isOpen && setIsOpen(false)}
            onMouseDown={() => isOpen && setIsOpen(false)}
         >
            {children}
         </div>
         {/* Tool Tip */}
         <DelayedUnmount
            conditional={isOpen && !!text && conditional}
            duration={120}
            styleTransition={transition}
            className={`pos-absolute ${styles.box} ${styles[allignmentY]}`}
         >
            <div className={`${styles.tooltip} ${styles[allignmentX]}`}>
               <div>{text}</div>
            </div>
         </DelayedUnmount>
      </div>
   )
}

export { ToolTip }
