declare module 'jsdom-global';
declare module 'tape' {
  export interface Test {
    deepEqual: (actual: any, expected: any, msg?: string) => void;
    true: (value: any, msg?: string) => void;
    equal: (actual: any, expected: any, msg?: string) => void;
    end: () => void;
    fail: (msg?: string) => void;
  }
  export default function test(name: string, cb: (t: Test) => void): void;
}

declare module 'node-localstorage' {
  export class LocalStorage implements Storage {
    constructor(location: string);
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    clear(): void;
    key(index: number): string | null;
    readonly length: number;
  }
}

declare module 'fs' {
  export function readFileSync(path: string, encoding: string): string;
}

declare module 'path' {
  export function resolve(...pathSegments: string[]): string;
}

// Define TodoItem interface
interface TodoItem {
  id: number;
  title: string;
  done: boolean;
}

// Define TodoModel interface
interface TodoModel {
  todos: TodoItem[];
  hash: string;
  editing?: number;
  all_done?: boolean;
}

// Declare todo-app module
declare module 'lib/todo-app' {
  export const model: TodoModel;
  export function update(action: string, model: TodoModel, data?: any): TodoModel;
  export function render_item(todo: TodoItem, model: TodoModel, signal?: (action: string, data?: any) => void): HTMLElement;
  export function render_main(model: TodoModel, signal: (action: string, data?: any) => void): HTMLElement;
  export function render_footer(model: TodoModel, signal: (action: string, data?: any) => void): HTMLElement;
  export function view(model: TodoModel, signal: (action: string, data?: any) => void): HTMLElement;
  export function subscriptions(signal: (action: string, data?: any) => void): void;
}

// Declare elmish module
declare module 'lib/elmish' {
  export function empty(element: HTMLElement): void;
  export function mount(
    model: TodoModel,
    update: (action: string, model: TodoModel, data?: any) => TodoModel,
    view: (model: TodoModel, signal: (action: string, data?: any) => void) => HTMLElement,
    id: string,
    subscriptions: (signal: (action: string, data?: any) => void) => void
  ): void;
}

// Declare global interfaces
interface Window {
  getComputedStyle(elt: Element): CSSStyleDeclaration;
  localStorage: Storage;
  onhashchange: (() => void) | null;
}

interface CSSStyleDeclaration {
  display: string;
  _values?: {
    display: string;
  };
}

// Declare localStorage
declare var localStorage: Storage;

// Extend global HTMLElement
interface HTMLElement {
  value?: string;
  onclick?: (event: MouseEvent) => void;
}

// Extend global NodeJS interface
declare namespace NodeJS {
  interface Global {
    localStorage: Storage;
  }
}
