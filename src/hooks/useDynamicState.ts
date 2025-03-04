import { useState } from "react"

/** Initial Default State (Dynamic object of unknown values) */
export type DynamicState = { [key: string]: unknown }

/** Nested Callback (prevState passed as argument to `propValue`) */
type SetCallback<T, K extends keyof T> = (currValue: T[K]) => T[K]

/** setState Callback (Dynamic State & type safe)
 * Only valid keys with matching values for initialState
 * @param propKey - Accepts keys from `initialState`
 * @param propValue - Callback with prevState as prop or Value of matching type for `initialState[propKey]`
 */
export type SetterProp<S> = <K extends keyof S>(propKey: K, propValue: S[K] | SetCallback<S, K>) => void

interface Config {
   /** useSyncedState name (key for state slot access) */
   //    slot?: string
}

/**
 * Centralized safely typed synced state object manager (example: hold multiple input values)
 *
 * @param initialState - `useSyncedState` default Value
 * @returns [state, setSafeState]
 *
 * @example
 * const [inputs, setInputs] = useDynamicState({
 *    messageText: "",
 *    buttons: [
 *       { id: 1, text: "Button 1" },
 *       { id: 2, text: "Button 2" },
 *    ],
 * })
 *
 * // Update state for specific state property
 * setInputs("buttons", [{ id: 1, text: "Updated Button 1" }, { id: 2, text: "Updated Button 2" }])
 * console.log(inputs.buttons[0].text) // Output: "Updated Button 1"
 * setInputs("buttons", (prevButtons) => [...prevButtons, { id: 3, text: "Button 3" }])
 * // With callback
 * console.log(inputs.buttons.length) // Output: 3
 * console.log(inputs.buttons[2].text) // Output: "Button 3"
 */
export default function useDynamicState<S extends DynamicState>({ ...initialState } = {} as S, {}: Config = {}): [S, SetterProp<S>] {
   const [state, setReactState] = useState<S>(initialState)

   const setState: SetterProp<S> = (propKey, propValue) => {
      /** Update state for specific state property */
      setReactState((prevState) => ({
         ...prevState,
         [propKey]: typeof propValue === "function" ? (propValue as SetCallback<S, keyof S>)(prevState[propKey]) : propValue,
      }))
   }

   return [state, setState] // Alternative: declare return as const
}
