type PartialPick<T, E extends keyof T> = Partial<Pick<T, E>> & Omit<T, E>

type GuardPick<T, E extends keyof T> = Exclude<T, E> | T

/** children prop, Array or single Component */
type Component<E> = React.ReactElement<React.ComponentProps<E>, E>

/** React Event callback argument type buildeer from base type */
type EventFor<E extends Event> = E | E<HTMLDivElement, E>
