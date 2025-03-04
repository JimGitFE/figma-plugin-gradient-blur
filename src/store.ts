import { create } from "zustand"

const DEFAULT_RESOLUTION = 5
const DEFAULT_HANDLES = [
   { pos: 0, blur: 10, id: 1 },
   { pos: 75, blur: 4, id: 2 },
   { pos: 100, blur: 0, id: 3 },
]

interface GradientStep {
   blur: number
   pos: number
   id: number // unique id
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
}

/** Gradient User Inputted Config */
const useProperties = create<Properties>((set) => ({
   grad: {
      angle: 90,
      resolution: DEFAULT_RESOLUTION,
      handles: DEFAULT_HANDLES,
   },
   setGrad: (grad) => set((state) => ({ grad: { ...state.grad, ...grad } })),
   updateHandle: (index, handle) =>
      set((state) => {
         const newHandles = [...state.grad.handles]
         newHandles[index] = { ...newHandles[index], ...handle }
         return { grad: { ...state.grad, handles: newHandles } }
      }),
}))

export { useProperties }
