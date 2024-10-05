declare module 'lib/todo-app' {
  export function render_item(todo: any, model: any, signal: any): HTMLElement;
  export function render_main(model: any, signal: any): HTMLElement;
  export function render_footer(model: any): HTMLElement;
  export function view(model: any): HTMLElement;
  export const model: any;
  export function update(msg: any, model: any): any;
}

declare module 'lib/elmish' {
  export function empty(element: HTMLElement | null): void;
  export function mount(model: any, update: Function, view: Function, id: string, subscriptions: Function): void;
}

declare module 'tape' {
  export interface Test {
    equal(actual: any, expected: any, msg?: string): void;
    deepEqual(actual: any, expected: any, msg?: string): void;
    end(): void;
  }

  export default function test(name: string, cb: (t: Test) => void): void;
}
