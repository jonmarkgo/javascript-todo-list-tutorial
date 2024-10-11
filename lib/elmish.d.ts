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
  export function a(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: HTMLElement[]): HTMLElement;
  export function button(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: HTMLElement[]): HTMLElement;
  export function div(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: HTMLElement[]): HTMLElement;
  export function footer(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: HTMLElement[]): HTMLElement;
  export function header(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: HTMLElement[]): HTMLElement;
  export function h1(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: HTMLElement[]): HTMLElement;
  export function input(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: HTMLElement[]): HTMLElement;
  export function label(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: HTMLElement[]): HTMLElement;
  export function li(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: HTMLElement[]): HTMLElement;
  export function span(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: HTMLElement[]): HTMLElement;
  export function strong(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: HTMLElement[]): HTMLElement;
  export function text(text: string): Text;
  export function ul(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: HTMLElement[]): HTMLElement;
  export function route(url: string): void;

  // Add the missing add_attributes function
  export function add_attributes(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], node: HTMLElement): HTMLElement;

  type SignalFunction<T> = (action: string, data?: any, model?: T) => () => void;
}
