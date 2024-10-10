// Define the Model interface
interface Model {
  counters: number[];
}

// Define the Action type
type Action = 'inc' | 'dec' | 'reset';

// Declare the core functions
declare function test(name: string, callback: (assert: Assert) => void): void;
declare function update(action: Action, model: Model): Model;
declare function mount(model: Model, update: (action: Action, model: Model) => Model, view: (model: Model, signal: (action: Action) => () => void) => HTMLElement, root_element_id: string): void;
declare function empty(node: HTMLElement): void;
declare function div(divid: string, text?: string): HTMLDivElement;
declare function view(model: Model): HTMLElement;

// Define the Assert interface
interface Assert {
  equal: (actual: any, expected: any) => void;
}
