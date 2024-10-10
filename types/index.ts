export interface Todo {
  id: number;
  title: string;
  done: boolean;
}

export interface Model {
  todos: Todo[];
  hash: string;
  clicked?: number;
  click_time?: number;
  editing?: number;
  all_done?: boolean;
}

export type Action =
  | { type: 'ADD'; title: string }
  | { type: 'TOGGLE'; id: number }
  | { type: 'DESTROY'; id: number }
  | { type: 'EDIT'; id: number }
  | { type: 'SAVE'; id: number; title: string }
  | { type: 'CANCEL'; id: number }
  | { type: 'TOGGLE_ALL' }
  | { type: 'CLEAR_COMPLETED' };

export type Signal = (action: Action) => void;
