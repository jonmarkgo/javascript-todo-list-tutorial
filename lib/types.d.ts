// Define the Todo type
export interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

// Define any other types used in the application
export interface Model {
  todos: Todo[];
  hash: string;
}

export type Signal = (action: string, data: any) => void;
