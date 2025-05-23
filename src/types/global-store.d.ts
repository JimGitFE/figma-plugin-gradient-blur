interface GradientStep {
   blur: number
   pos: number
   uniqueId: number
}

interface Gradient {
   angle: number
   resolution: number
   handles: GradientStep[]
}

interface Properties {
   grad: Gradient
   setGrad: (grad: Partial<Gradient>) => void
   updateHandle: (index: number, handle: Partial<GradientStep>) => void
   /** Reorder */
   sortHandles: () => void
   /** Remove uniqueId handle */
   removeHandle: (uniqueId: number) => void
   /** Add at position */
   addHandle: (newHandle: Omit<GradientStep, "uniqueId">, at?: number) => void
}
