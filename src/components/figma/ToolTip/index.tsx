import React, { useLayoutEffect, useRef, useState, createContext, useContext, useEffect, forwardRef } from "react"
import { DelayedUnmount } from "@/components/custom"
import styles from "./tool-tip.module.scss"
import { useResizeObserver } from "@/hooks/useResizeObserver"

/** Delayed unmount transition */
const transition: [React.CSSProperties, React.CSSProperties] = [
   { opacity: 0, transform: "translateY(4px)" },
   { opacity: 1, transform: "translateY(0)" },
]

interface Props extends React.HTMLAttributes<HTMLDivElement> {
   children: React.ReactNode
   text?: string
   /** Allignment X */
   allignX?: "left" | "right" | "auto"
   allignY?: "top" | "bottom"
   /** Render when true */
   conditional?: boolean
   /** Container Ref `{width, left, right}` */
   contRect?: DOMRect
}

/** Wrapper */
function Item({ text, allignX = "auto", allignY, conditional = true, contRect: propContRect, children, ...atts }: Props) {
   const [isOpen, setIsOpen] = useState(false)

   /** Container Group Context DOMRect & Timeout */
   const contGroup = ContCtx ? useContext(ContCtx) : null
   const contRect = contGroup?.contRect || propContRect
   /** Tooltip wrap div */
   const wrapRef = useRef<HTMLDivElement>(null)
   /** tooltip dynamic x */
   const tipRef = useRef<HTMLDivElement>(null)
   const [allignmentX, setAllignmentX] = useState<"left" | "right" | "auto">(allignX)
   const [allignmentY, setAllignmentY] = useState<"top" | "bottom">(allignY || "bottom")

   /* Dynamic allignment on container / window overflow */
   useLayoutEffect(() => {
      if (wrapRef.current) {
         // 1
         /** Wrap rect dimensions { width, height, left, right, bottom } */
         const wrap = wrapRef.current.getBoundingClientRect() // button
         /** Tooltip Rect dimensions */
         const tip = { width: tipRef.current?.getBoundingClientRect().width || (text?.length * 5.5 ?? 150), height: 24 + 3, rad: 6 }
         /** Container Rect */
         const container = {
            width: contRect?.width ?? window.innerWidth,
            height: contRect?.height ?? window.innerHeight,
            left: contRect?.left ?? 0,
            right: contRect?.right ?? window.innerWidth,
         }

         // Wrap css vars
         wrapRef.current.style.setProperty("--wrap-width", `${wrap.width}px`)
         wrapRef.current.style.setProperty("--wrap-height", `${wrap.height}px`)
         wrapRef.current.style.setProperty("--wrap-left", `${wrap.left}px`)
         wrapRef.current.style.setProperty("--wrap-right", `${wrap.right}px`)
         // Container css vars
         wrapRef.current.style.setProperty("--cont-width", `${container.width}px`)
         wrapRef.current.style.setProperty("--cont-left", `${container.left}px`)
         wrapRef.current.style.setProperty("--cont-right", `${container.right}px`)

         // 2
         /* Horizontal Axis auto allignment */
         const overflowedX = (tip.width - wrap.width) / 2
         if (allignX === "auto") {
            if (wrap.right - container.left + overflowedX > container.width) {
               setAllignmentX("right")
            } else if (wrap.left + container.left - overflowedX < container.left) {
               setAllignmentX("left")
            } else {
               setAllignmentX("auto") // reset
            }
         }
         // Vertical Axis
         if (wrap.bottom + tip.height + 12 > container.height && !allignY) setAllignmentY("top")
      }
   }, [wrapRef.current, tipRef.current, contRect])

   /* Events */
   const mouseLeave = () => {
      contGroup?.leave()
      isOpen && setIsOpen(false)
   }

   const mouseEnter = () => {
      if (text) contGroup?.enter()
      !isOpen && setIsOpen(true)
   }

   return (
      <div {...atts} ref={wrapRef} className={`pos-relative ${styles.wrap} ${atts.className}`}>
         {/* Item */}
         <div onMouseEnter={mouseEnter} onMouseLeave={mouseLeave} onMouseDown={mouseLeave} onMouseMove={() => contGroup?.move()}>
            {children}
         </div>
         {/* Shared hover delay */}
         {(contGroup?.isAvailable ?? true) && (
            // Tool Tip
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
         )}
      </div>
   )
}

/* Context Provider */

interface ContCtxConfig {
   contRect: DOMRect
   isAvailable: boolean
   enter: () => void
   leave: () => void
   move: () => void
}

/** Tooltips container context */
const ContCtx = createContext<ContCtxConfig>(null)

interface ContProps extends React.HTMLAttributes<HTMLDivElement> {
   /** Override Rect (defaults to group wrap) */
   contRect?: DOMRect
}

/** Tooltips group wrapper
 * Items boundary - "auto" positioned allignment
 * Timeouts - show after delay & steady hover (keep showing until grace threshold)
 */
const Container = forwardRef(({ children, contRect: propContRect, ...atts }: ContProps, propRef: React.Ref<HTMLDivElement>) => {
   // 1
   /* Tooltip containers allginment */

   const contRef = useRef<HTMLDivElement>(null) // Default ref if no ref forwarded
   const ref: typeof contRef = (propRef as React.MutableRefObject<HTMLDivElement | null>) ?? contRef

   /** Default cont rect (if no prop override) */
   const [defContRect, setDefContRect] = useState<DOMRect>({} as DOMRect)
   const [contRect, setContRect] = useState<DOMRect>({} as DOMRect)

   /* Calculate rect */
   useEffect(() => setDefContRect(ref.current?.getBoundingClientRect()), [ref])
   useEffect(() => setContRect(propContRect || defContRect), [propContRect, defContRect])

   // 2
   /* Global timeouts (shared hover delay) */
   const [isAvailable, setIsAvailable] = useState(false)
   const [delay, grace] = [400, 250]
   // const lastEvent = useRef(0) // timestamp
   const delayTimer = useRef<ReturnType<typeof setTimeout> | null>(null) // timeout
   const graceTimer = useRef<ReturnType<typeof setTimeout> | null>(null) // timeout

   /** Mouseenter a tooltip (start count) */
   const enter = () => {
      // Initialize hover delay
      delayTimer.current = setTimeout(() => {
         setIsAvailable(true)
      }, delay)

      // Cleanup
      clearTimeout(graceTimer.current)
      graceTimer.current = null
   }

   /** Mouseleave a tooltip (count grace) */
   const leave = () => {
      if (isAvailable) {
         graceTimer.current = setTimeout(() => {
            setIsAvailable(false)
            clearTimeout(delayTimer.current)
            delayTimer.current = null
         }, grace)
      } else {
         clearTimeout(delayTimer.current)
         delayTimer.current = null
      }
   }

   /** MouseMove reset delay */
   const move = () => {
      if (delayTimer.current) {
         clearTimeout(delayTimer.current)
         delayTimer.current = setTimeout(() => {
            setIsAvailable(true)
         }, delay)
      }
   }

   const cleanup = () => {
      delayTimer.current && clearTimeout(delayTimer.current)
      graceTimer.current && clearTimeout(graceTimer.current)
   }

   // Clear timer on unmount
   useEffect(() => cleanup, [])

   return (
      <div {...atts} ref={ref}>
         <ContCtx.Provider value={{ contRect, isAvailable, enter, leave, move }}>{children}</ContCtx.Provider>
      </div>
   )
})

/* Utils */

/** Helper function
 * @example
 * const fakeRect = new DOMRect(100, 200, 300, 400); // x, y, width, height
 * const fakeContainerRef = fakeRectRef(fakeRect);
 *
 * console.log(fakeContainerRef.current.getBoundingClientRect()); // Logs the fake rect
 * @deprecated (DOMRect should be used)
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
const ToolTip = {
   /** Tooltip, method: Wrapper */
   Item,
   /** Tooltips group wrapper
    * Items boundary - "auto" positioned allignment
    * Timeouts - show after delay (keep showing until threshold)
    */
   Container,
}

export { ToolTip, fakeRectRef }
