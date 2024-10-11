// Type definitions for the elmish module
declare module '../src/elmish' {
  export type SignalFunction<T> = (action: string, data?: any, model?: T) => () => void;

  export function empty(node: HTMLElement): void;

  export function mount<T extends object>(
    model: T,
    update: (action: string, model: T, data?: any) => T,
    view: (model: T, signal: SignalFunction<T>) => HTMLElement,
    root_element_id: string,
    subscriptions?: (signal: SignalFunction<T>) => void
  ): void;

  // Add other necessary type definitions here
}
