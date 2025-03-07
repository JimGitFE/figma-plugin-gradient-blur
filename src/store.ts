import { create } from "zustand"

const DEFAULT_RESOLUTION = 5
const DEFAULT_HANDLES = [
   { pos: 0, blur: 10, uniqueId: 1 },
   { pos: 75, blur: 4, uniqueId: 2 },
   { pos: 100, blur: 0, uniqueId: 3 },
   { pos: 120, blur: 3, uniqueId: 5 },
   { pos: 130, blur: 8, uniqueId: 6 },
]

/** Gradient User Inputted Config */
const useProperties = create<Properties>((set) => ({
   grad: {
      angle: 90,
      resolution: DEFAULT_RESOLUTION,
      handles: DEFAULT_HANDLES,
   },
   setGrad: (grad) => set((state) => ({ grad: { ...state.grad, ...grad } })),
   updateHandle: (uniqueId, handle) =>
      set((state) => {
         const index = state.grad.handles.findIndex((h) => h.uniqueId === uniqueId)
         const newHandles = [...state.grad.handles]
         newHandles[index] = { ...newHandles[index], ...handle }
         return { grad: { ...state.grad, handles: newHandles } }
      }),
   sortHandles: () =>
      set((state) => {
         const sortedHandles = [...state.grad.handles].sort((a, b) => a.pos - b.pos)
         return { grad: { ...state.grad, handles: sortedHandles } }
      }),
}))

export { useProperties }
