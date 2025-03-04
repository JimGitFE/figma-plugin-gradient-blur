type PartialPick<T, E extends keyof T> = Partial<Pick<T, E>> & Omit<T, E>

type GuardPick<T, E extends keyof T> = Exclude<T, E> | T
