// clamp number
export const clamp = (num: number, { min, max }: { min?: number; max?: number }) => {
   if (min !== undefined && num < min) return min
   if (max !== undefined && num > max) return max
   return num
}

export const modulo = (num: number, modulo: number) => ((num % modulo) + modulo) % modulo

export const isNum = (num: any): num is number => typeof num === "number"

export const refContains = (ref: React.RefObject<HTMLElement>, e: Event) => ref.current?.contains(e.target as Node)
