/** Shared heading for inputs section */
// Dependencies
import React from "react"
// Components
import { SmallButton } from "@/components/figma"

interface Props extends React.HTMLAttributes<HTMLDivElement> {
   children?: React.ReactNode
   buttons?: Omit<React.ComponentProps<typeof SmallButton>, "large">[]
}

function Heading({ children, buttons, ...atts }: Props) {
   return (
      <div {...atts} className={`heading d-f jc-sb ai-c`}>
         {children}
         <div className="d-f">
            {buttons?.map((button, i) => (
               <SmallButton key={i} {...button} large />
            ))}
         </div>
      </div>
   )
}

export { Heading }
