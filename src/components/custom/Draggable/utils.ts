// Utils

/** Move & displace items in array */
export const reorder = <T extends {}>(source: T[], from: number, to: number): T[] => {
   const sourceCopy = [...source]
   const [movedElement] = sourceCopy.splice(from, 1)
   sourceCopy.splice(to, 0, movedElement)
   return sourceCopy
}

export function isBetween(idxMid, idxA, idxB) {
   const low = Math.min(idxA, idxB)
   const high = Math.max(idxA, idxB)
   return idxMid >= low && idxMid <= high
}
