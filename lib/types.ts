// Define shared types and interfaces for the todo app

export type TodoAction = 'ADD' | 'TOGGLE' | 'TOGGLE_ALL' | 'DELETE' | 'EDIT' | 'SAVE' | 'CANCEL' | 'CLEAR_COMPLETED' | 'ROUTE';

export interface Todo {
  id: number;
  title: string;
  done: boolean;
}

export interface TodoModel {
  todos: Todo[];
  hash: string;
  clicked?: number;
  click_time?: number;
  editing?: number;
  all_done?: boolean;
}

export type TodoSignalFunction = (action: TodoAction, data?: any) => void;

export type TodoUpdateFunction = (action: TodoAction, model: TodoModel, data?: any) => TodoModel;

export type TodoViewFunction = (model: TodoModel, signal: TodoSignalFunction) => HTMLElement;

export type TodoSubscriptionsFunction = (signal: TodoSignalFunction) => void;
