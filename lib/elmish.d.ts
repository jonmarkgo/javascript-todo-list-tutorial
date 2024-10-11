declare module 'elmish' {
  export function empty(node: HTMLElement): void;
  export function mount<T>(
    model: T,
    update: (action: string, model: T, data?: any) => T,
    view: (model: T, signal: SignalFunction<T>) => HTMLElement,
    root_element_id: string,
    subscriptions?: (signal: SignalFunction<T>) => void
  ): void;

  export function add_attributes(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], node: HTMLElement): HTMLElement;
  export function append_childnodes(nodes: HTMLElement[], parent: HTMLElement): void;
  export function text(content: string): Text;

  export function section(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: (HTMLElement | string)[]): HTMLElement;
  export function a(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: (HTMLElement | string)[]): HTMLAnchorElement;
  export function button(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: (HTMLElement | string)[]): HTMLButtonElement;
  export function div(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: (HTMLElement | string)[]): HTMLDivElement;
  export function footer(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: (HTMLElement | string)[]): HTMLElement;
  export function header(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: (HTMLElement | string)[]): HTMLElement;
  export function h1(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: (HTMLElement | string)[]): HTMLHeadingElement;
  export function input(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: (HTMLElement | string)[]): HTMLInputElement;
  export function label(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: (HTMLElement | string)[]): HTMLLabelElement;
  export function ul(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: (HTMLElement | string)[]): HTMLUListElement;
  export function li(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: (HTMLElement | string)[]): HTMLLIElement;
  export function span(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: (HTMLElement | string)[]): HTMLSpanElement;
  export function strong(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: (HTMLElement | string)[]): HTMLElement;
}

type SignalFunction<T> = (action: string, data?: any, model?: T) => () => void;
