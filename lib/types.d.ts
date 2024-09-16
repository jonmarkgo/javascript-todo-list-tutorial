// Declare the update function globally
declare function update(action: string, model: TodoState, data?: any): TodoState;

// Define the TodoState interface
interface TodoState {
  todos: Todo[];
  hash: string;
  all_done?: boolean;
  clicked?: number;
  click_time?: number;
  editing?: number;
}

// Define the Todo interface
interface Todo {
  id: number;
  title: string;
  done: boolean;
}

// Declare global functions
declare function mount(model: TodoState, update: Function, view: Function, id: string): void;
declare function view(model: TodoState, signal: Function): HTMLElement;
declare function empty(element: HTMLElement): void;
declare function div(attributes: string[]): HTMLElement;

// Declare QUnit types
declare module 'qunit' {
  export function test(name: string, callback: (assert: Assert) => void): void;
  export interface Assert {
    equal(actual: any, expected: any, message?: string): void;
  }
}

// QUnit types are now included in the 'qunit' module declaration

// Declare elmish functions
declare function a(attributes: string[], children?: any[]): HTMLElement;
declare function button(attributes: string[], children?: any[]): HTMLElement;
declare function footer(attributes: string[], children?: any[]): HTMLElement;
declare function h1(attributes: string[], children?: any[]): HTMLElement;
declare function header(attributes: string[], children?: any[]): HTMLElement;
declare function input(attributes: string[], children?: any[]): HTMLElement;
declare function label(attributes: string[], children?: any[]): HTMLElement;
declare function li(attributes: string[], children?: any[]): HTMLElement;
declare function section(attributes: string[], children?: any[]): HTMLElement;
declare function span(attributes: string[], children?: any[]): HTMLElement;
declare function strong(text: string | number): HTMLElement;
declare function text(content: string): Text;
declare function ul(attributes: string[], children?: any[]): HTMLElement;
