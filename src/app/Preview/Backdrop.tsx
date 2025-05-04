// Internal
import React, { ReactNode } from "react"
import { ResolutionBlur } from "gradient-blur"
import { useProperties } from "@/store"
// import "grad-blur"

const DEFAULT = {
   handles: [
      { pos: 0, blur: 10 },
      { pos: 20, blur: 10 },
      { pos: 80, blur: 0 },
      { pos: 100, blur: 2 },
   ],
   resolution: 8,
   angle: 90,
}

interface Props {
   children: ReactNode
}

/** Blur Effect */
export default function Backdrop({ children }: Props) {
   const { resolution, handles, angle } = useProperties((state) => state.grad)

   return (
      <div className="pos-relative h-100 w-100">
         <ResolutionBlur
            handles={handles ?? DEFAULT.handles}
            type="linear"
            angle={angle ?? DEFAULT.angle}
            resolution={Math.round(resolution) ?? DEFAULT.resolution}
         />
         {children}
      </div>
   )
}
