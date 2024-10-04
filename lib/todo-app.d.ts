export interface Todo {
  id: number;
  title: string;
  done: boolean;
}

export interface Model {
  todos: Todo[];
  hash: string;
  input: string;
}

export type Action =
  | { type: 'ADD'; text: string }
  | { type: 'TOGGLE'; id: number }
  | { type: 'DESTROY'; id: number }
  | { type: 'CLEAR_COMPLETED' }
  | { type: 'TOGGLE_ALL' }
  | { type: 'UPDATE_INPUT'; text: string }
  | { type: 'EDIT'; id: number }
  | { type: 'SAVE'; id: number; text: string }
  | { type: 'CANCEL'; id: number }
  | { type: 'SET_HASH'; hash: string };

export type SignalFunction<A> = (action: A) => void;

export function update(action: Action, model: Model, data?: any): Model;
export function view(model: Model, signal: SignalFunction<Action>): HTMLElement;
export function subscriptions(signal: SignalFunction<Action>): void;
export function init(): Model;

export function render_item(todo: Todo, model: Model, signal: SignalFunction<Action>): HTMLElement;
export function render_main(model: Model, signal: SignalFunction<Action>): HTMLElement;
export function render_footer(model: Model, signal: SignalFunction<Action>): HTMLElement;

// No need for explicit re-exports as they are already exported above

// Ensure these types are available for import
