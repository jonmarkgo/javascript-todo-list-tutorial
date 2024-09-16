import { TodoModel } from './todo-app';

export function empty(element: HTMLElement): void;
export function mount(
  model: TodoModel,
  update: (action: string, model: TodoModel, data?: any) => TodoModel,
  view: (model: TodoModel, signal: (action: string, data?: any) => void) => HTMLElement,
  id: string,
  subscriptions: (signal: (action: string, data?: any) => void) => void
): void;
