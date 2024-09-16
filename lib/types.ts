// Export the TodoState interface
export interface TodoState {
  todos: Todo[];
  hash: string;
  all_done?: boolean;
  clicked?: number;
  click_time?: number;
  editing?: number;
}

// Export the Todo interface
export interface Todo {
  id: number;
  title: string;
  done: boolean;
}

// QUnit Assert interface
export interface Assert {
  ok(value: any, message?: string): void;
  equal(actual: any, expected: any, message?: string): void;
  deepEqual(actual: any, expected: any, message?: string): void;
}

// Export global function types
export type UpdateFunction = (action: string, model: TodoState, data?: any) => TodoState;
export type MountFunction = (model: TodoState, update: UpdateFunction, view: ViewFunction, id: string) => void;
export type ViewFunction = (model: TodoState, signal: Function) => HTMLElement;
export type EmptyFunction = (element: HTMLElement) => void;

// Export HTML element creation function types
export type HTMLElementFunction = (attributes: string[], children?: any[]) => HTMLElement;
export type TextFunction = (content: string) => Text;
export type StrongFunction = (text: string | number) => HTMLElement;

// Export elmish function types
export type AFunction = HTMLElementFunction;
export type ButtonFunction = HTMLElementFunction;
export type FooterFunction = HTMLElementFunction;
export type H1Function = HTMLElementFunction;
export type HeaderFunction = HTMLElementFunction;
export type InputFunction = HTMLElementFunction;
export type LabelFunction = HTMLElementFunction;
export type LiFunction = HTMLElementFunction;
export type SectionFunction = HTMLElementFunction;
export type SpanFunction = HTMLElementFunction;
