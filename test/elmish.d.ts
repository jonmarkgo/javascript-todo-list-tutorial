// Create a type declaration file for the elmish module
declare module 'elmish' {
  export function empty(node: HTMLElement): void;
  export function mount<T>(
    model: T,
    update: (action: string, model: T, data?: any) => T,
    view: (model: T, signal: SignalFunction<T>) => HTMLElement,
    root_element_id: string,
    subscriptions?: (signal: SignalFunction<T>) => void
  ): void;

  export function section(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: HTMLElement[]): HTMLElement;
  export function a(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: HTMLElement[]): HTMLAnchorElement;
  export function button(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: HTMLElement[]): HTMLButtonElement;
  export function div(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: HTMLElement[]): HTMLDivElement;
  export function footer(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: HTMLElement[]): HTMLElement;
  export function header(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: HTMLElement[]): HTMLElement;
  export function h1(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: HTMLElement[]): HTMLHeadingElement;
  export function input(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: HTMLElement[]): HTMLInputElement;
  export function label(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: HTMLElement[]): HTMLLabelElement;
  export function ul(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: HTMLElement[]): HTMLUListElement;
  export function li(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: HTMLElement[]): HTMLLIElement;
  export function span(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: HTMLElement[]): HTMLSpanElement;
  export function strong(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: HTMLElement[]): HTMLElement;

  // Declare add_attributes as a function on the module
  export const add_attributes: (attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], node: HTMLElement) => HTMLElement;
  export function append_childnodes(nodes: HTMLElement[], parent: HTMLElement): void;
  export function text(content: string): Text;
}

type SignalFunction<T> = (action: string, data?: any, model?: T) => () => void;
