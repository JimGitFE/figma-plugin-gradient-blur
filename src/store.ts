import { create } from "zustand"

// TODO: Presets
const DEFAULT = {
   /** exponential gradient at pos 33 */
   handles: [
      { pos: 0, blur: 1, uniqueId: 1 },
      { pos: 33, blur: 2, uniqueId: 2 },
      { pos: 55, blur: 3, uniqueId: 3 },
      { pos: 77, blur: 50, uniqueId: 5 },
      { pos: 100, blur: 60, uniqueId: 6 },
   ],
   angle: 110,
   resolution: 32,
   lastUniqueId: 6,
}

/** Gradient User Inputted Config */
const useProperties = create<Properties>((set) => ({
   grad: {
      angle: DEFAULT.angle,
      resolution: DEFAULT.resolution,
      handles: DEFAULT.handles,
      lastUniqueId: DEFAULT.lastUniqueId,
   },
   lastUniqueId: 6,
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
         const maxUId = state.lastUniqueId
         const newHandle = { ...handleProps, uniqueId: maxUId + 1 }
         const newHandles = [...state.grad.handles]
         if (at) newHandles.splice(at, 0, newHandle)
         else newHandles.push(newHandle)
         console.log(newHandles)
         return { grad: { ...state.grad, handles: newHandles }, lastUniqueId: maxUId + 1 }
      }),
}))

/** Figma API (selected frame) */

/** App Config */

export { useProperties }
