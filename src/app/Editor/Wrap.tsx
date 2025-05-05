// Dependencies
import React, { useRef, useState } from "react"
// Components
import { ToolTip } from "@/components/figma"
// Internal
import { useResizeObserver } from "@/hooks/useResizeObserver"

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
   children?: React.ReactNode
}

/** Properties Panel Input sections */
export default function Wrap({ children, ...atts }: PanelProps) {
   /* Tooltip containers allginment */
   const panelRef = useRef<HTMLDivElement>(null)
   const [contRect, setContRect] = useState<DOMRect>({} as DOMRect) // + margins

   /* Implement margins to shared tooltips rect reference */
   useResizeObserver({
      ref: panelRef,
      callback: () => {
         const rect = panelRef.current.getBoundingClientRect()
         setContRect({ ...rect, height: rect.height, top: rect.top, left: rect.left + 16, right: rect.right - 9, width: rect.width - 25 })
      },
   })

   return (
      <ToolTip.Container {...atts} ref={panelRef} contRect={contRect}>
         {children}
      </ToolTip.Container>
   )
}
