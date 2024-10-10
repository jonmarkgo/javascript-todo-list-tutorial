// Type declarations

declare interface Model {
  counters: number[];
}

declare interface Assert {
  equal: (actual: any, expected: any) => void;
}

declare type Action = 'inc' | 'dec' | 'reset';

declare function test(name: string, callback: (assert: Assert) => void): void;
declare function update(model: Model, action?: Action): Model;
declare function mount(model: Model, update: (model: Model, action?: Action) => Model, view: (model: Model) => HTMLElement, id: string): void;
declare function empty(element: HTMLElement | null): void;
declare function div(id: string): HTMLElement;
declare function view(model: Model): HTMLElement;
