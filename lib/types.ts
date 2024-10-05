// lib/types.ts

export interface TodoItem {
  id: number;
  title: string;
  completed: boolean;
}

export interface Model {
  todos: TodoItem[];
  hash: string;
  visibility: string;
  editing?: number;
}

export type Action =
  | { type: 'ADD'; title: string }
  | { type: 'TOGGLE'; id: number }
  | { type: 'DELETE'; id: number }
  | { type: 'UPDATE'; id: number; title: string }
  | { type: 'TOGGLE_ALL' }
  | { type: 'CLEAR_COMPLETED' }
  | { type: 'SET_VISIBILITY'; filter: string };

export interface Signal {
  (action: string, data?: any): void;
}

export interface Test {
  equal(actual: any, expected: any, msg?: string): void;
  deepEqual(actual: any, expected: any, msg?: string): void;
  end(): void;
}

export type TodoModel = Model;
