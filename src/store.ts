import { create } from "zustand"

// TODO: Presets
const DEFAULT = {
   /** exponential gradient at pos 33 */
   handles: [
      { pos: 0, blur: 0, uniqueId: 1 },
      { pos: 33, blur: 0, uniqueId: 2 },
      { pos: 55, blur: 4, uniqueId: 3 },
      { pos: 77, blur: 30, uniqueId: 5 },
      { pos: 100, blur: 64, uniqueId: 6 },
   ],
   angle: 110,
   resolution: 32,
}

/** Gradient User Inputted Config */
const useProperties = create<Properties>((set) => ({
   grad: {
      angle: DEFAULT.angle,
      resolution: DEFAULT.resolution,
      handles: DEFAULT.handles,
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
   removeHandle: (uniqueId) =>
      set((state) => {
         const newHandles = state.grad.handles.filter((h) => h.uniqueId !== uniqueId)
         return { grad: { ...state.grad, handles: newHandles } }
      }),
   addHandle: (handleProps, at) =>
      set((state) => {
         const maxUId = Math.max(...state.grad.handles.map((h) => h.uniqueId), 0)
         const newHandle = { ...handleProps, uniqueId: maxUId + 1 }
         const newHandles = [...state.grad.handles]
         if (at) newHandles.splice(at, 0, newHandle)
         else newHandles.push(newHandle)
         return { grad: { ...state.grad, handles: newHandles } }
      }),
}))

/** Figma API (selected frame) */

/** App Config */

export { useProperties }
