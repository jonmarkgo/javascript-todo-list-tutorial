import { TodoModel } from './todo-app';

export type Model = TodoModel;
export type Action = string;
export type Data = any;
export type UpdateFunction = (action: Action, model: Model, data?: Data) => Model;
export type SignalFunction = (action: Action, data?: Data, model?: Model) => () => void;
export type ViewFunction = (model: Model, signal: SignalFunction) => HTMLElement;
export type SubscriptionFunction = (signal: SignalFunction) => void;

export interface ElementCreationFunction {
  (attrlist: (string | Function)[], childnodes: HTMLElement[]): HTMLElement;
}

export function empty(element: HTMLElement): void;

export function mount(
  model: Model,
  update: UpdateFunction,
  view: ViewFunction,
  root_element_id: string,
  subscriptions?: SubscriptionFunction
): void;

export function add_attributes(attrlist: (string | Function)[], node: HTMLElement): HTMLElement;
export function append_childnodes(childnodes: HTMLElement[], parent: HTMLElement): HTMLElement;
export function create_element(type: string, attrlist: (string | Function)[], childnodes: HTMLElement[]): HTMLElement;

export const section: ElementCreationFunction;
export const a: ElementCreationFunction;
export const button: ElementCreationFunction;
export const div: ElementCreationFunction;
export const footer: ElementCreationFunction;
export const header: ElementCreationFunction;
export const h1: ElementCreationFunction;
export const input: ElementCreationFunction;
export const label: ElementCreationFunction;
export const li: ElementCreationFunction;
export const span: ElementCreationFunction;
export function strong(text_str: string): HTMLElement;
export function text(text: string): Text;
export const ul: ElementCreationFunction;

export function route(model: Model, title: string, hash: string): Model;
