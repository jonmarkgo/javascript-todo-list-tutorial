export interface TodoItem {
  id: number;
  title: string;
  done: boolean;
}

export interface TodoModel {
  todos: TodoItem[];
  hash: string;
  editing?: number;
  all_done?: boolean;
  clicked?: number;
  click_time?: number;
}
