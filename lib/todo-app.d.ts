interface TodoItem {
  id: number;
  title: string;
  done: boolean;
}

interface TodoModel {
  todos: TodoItem[];
  hash: string;
  editing?: number;
  all_done?: boolean;
}

export const model: TodoModel;
export function update(action: string, model: TodoModel, data?: any): TodoModel;
export function render_item(todo: TodoItem, model: TodoModel, signal?: (action: string, data?: any) => void): HTMLElement;
export function render_main(model: TodoModel, signal: (action: string, data?: any) => void): HTMLElement;
export function render_footer(model: TodoModel, signal: (action: string, data?: any) => void): HTMLElement;
export function view(model: TodoModel, signal: (action: string, data?: any) => void): HTMLElement;
export function subscriptions(signal: (action: string, data?: any) => void): void;
