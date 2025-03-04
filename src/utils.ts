// clamp number
export const clamp = (num: number, { min, max }: { min?: number; max?: number }) => {
   if (min !== undefined && num < min) return min
   if (max !== undefined && num > max) return max
   return num
}

export const modulo = (num: number, modulo: number) => ((num % modulo) + modulo) % modulo
