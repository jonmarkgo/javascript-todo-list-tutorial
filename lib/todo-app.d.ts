declare module '../lib/todo-app' {
  import { Model } from './elmish';

  export function empty(node: HTMLElement): void;
  export function mount<T>(
    model: T,
    update: (msg: any, model: T) => T,
    view: (model: T, signal: (msg: any) => () => void) => HTMLElement,
    id: string,
    subscriptions?: (model: T) => void
  ): void;
}
