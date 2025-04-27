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
   allignX?: "left" | "right" | "auto"
   allignY?: "top" | "bottom"
   /** Render when true */
   conditional?: boolean
   /** Container Ref */
   // containerRef?: React.MutableRefObject<HTMLDivElement>
   contRect?: DOMRect
}

/** Wrapper */
function ToolTip({ text, allignX = "auto", allignY, conditional = true, contRect, children, ...atts }: TipProps) {
   const [isOpen, setIsOpen] = useState(false)
   const wrapRef = useRef<HTMLDivElement>(null) // dimensions
   const tipRef = useRef<HTMLDivElement>(null) // tooltip dynamic x
   const [allignmentX, setAllignmentX] = useState<"left" | "right" | "auto">(allignX)
   const [allignmentY, setAllignmentY] = useState<"top" | "bottom">(allignY || "bottom")

   /* Dynamic allignment */
   useLayoutEffect(() => {
      if (wrapRef.current) {
         const { width, height, left, right, bottom } = wrapRef.current.getBoundingClientRect() // button

         wrapRef.current.style.setProperty("--wrap-width", `${width}px`)
         wrapRef.current.style.setProperty("--wrap-height", `${height}px`)
         wrapRef.current.style.setProperty("--wrap-left", `${left}px`)
         wrapRef.current.style.setProperty("--wrap-right", `${right}px`)

         /* Dynamic allignment on window overflow */
         const tip = { width: tipRef.current?.getBoundingClientRect().width || 150, height: 24 + 3 }
         // const container = contRect?.current?.getBoundingClientRect()
         const viewport = {
            width: contRect?.width ?? window.innerWidth,
            height: contRect?.height ?? window.innerHeight,
            left: contRect?.left ?? 0,
            right: contRect?.right ?? window.innerWidth,
         }

         wrapRef.current.style.setProperty("--cont-width", `${viewport.width}px`)
         wrapRef.current.style.setProperty("--cont-left", `${viewport.left}px`)
         wrapRef.current.style.setProperty("--cont-right", `${viewport.right}px`)

         // Horizontal Axis
         if (allignX === "auto") {
            if (right + tip.width / 2 > viewport.width) {
               setAllignmentX("right")
            } else if (left - tip.width / 2 < viewport.left) {
               console.log
               setAllignmentX("left")
            }
         }

         // Vertical Axis
         if (bottom + tip.height + 12 > viewport.height && !allignY) setAllignmentY("top")
      }
   }, [wrapRef.current, contRect])

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
            <div className={`${styles.tooltip} ${styles[allignmentX]}`} ref={tipRef}>
               <div>{text}</div>
            </div>
         </DelayedUnmount>
      </div>
   )
}

/** Helper function
 * @example
 * const fakeRect = new DOMRect(100, 200, 300, 400); // x, y, width, height
 * const fakeContainerRef = fakeRectRef(fakeRect);
 *
 * console.log(fakeContainerRef.current.getBoundingClientRect()); // Logs the fake rect
 */
function fakeRectRef(rect: DOMRect): React.MutableRefObject<HTMLDivElement> {
   return {
      current: {
         getBoundingClientRect: () => rect,
         style: {
            setProperty: (property: string, value: string) => {
               console.log(`Set style property: ${property} = ${value}`)
            },
         },
      } as unknown as HTMLDivElement,
   }
}

export { ToolTip, fakeRectRef }
