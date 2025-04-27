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
   /** Container Ref `{width, left, height, right}` */
   contRect?: DOMRect
}

/** Wrapper */
function ToolTip({ text, allignX = "auto", allignY, conditional = true, contRect, children, ...atts }: TipProps) {
   const [isOpen, setIsOpen] = useState(false)
   /** Tooltip wrap div */
   const wrapRef = useRef<HTMLDivElement>(null)
   /** tooltip dynamic x */
   const tipRef = useRef<HTMLDivElement>(null)
   const [allignmentX, setAllignmentX] = useState<"left" | "right" | "auto">(allignX)
   const [allignmentY, setAllignmentY] = useState<"top" | "bottom">(allignY || "bottom")

   /* Dynamic allignment */
   useLayoutEffect(() => {
      if (wrapRef.current) {
         /** Wrap rect dimensions { width, height, left, right, bottom } */
         const wrap = wrapRef.current.getBoundingClientRect() // button

         wrapRef.current.style.setProperty("--wrap-width", `${wrap.width}px`)
         wrapRef.current.style.setProperty("--wrap-height", `${wrap.height}px`)
         wrapRef.current.style.setProperty("--wrap-left", `${wrap.left}px`)
         wrapRef.current.style.setProperty("--wrap-right", `${wrap.right}px`)

         /* Dynamic allignment on window overflow */
         /** Tooltip Rect dimensions */
         const tip = { width: tipRef.current?.getBoundingClientRect().width || 150, height: 24 + 3 }
         /** Container Rect */
         const container = {
            width: contRect?.width ?? window.innerWidth,
            height: contRect?.height ?? window.innerHeight,
            left: contRect?.left ?? 0,
            right: contRect?.right ?? window.innerWidth,
         }

         console.log(text?.slice(0, 4), container.right - wrap.right)

         wrapRef.current.style.setProperty("--cont-width", `${container.width}px`)
         wrapRef.current.style.setProperty("--cont-left", `${container.left}px`)
         wrapRef.current.style.setProperty("--cont-right", `${container.right}px`)

         // Horizontal Axis
         if (allignX === "auto") {
            if (wrap.right + tip.width / 2 > container.width) {
               setAllignmentX("right")
            } else if (wrap.left - tip.width / 2 < container.left) {
               console.log
               setAllignmentX("left")
            }
         }

         // Vertical Axis
         if (wrap.bottom + tip.height + 12 > container.height && !allignY) setAllignmentY("top")
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
