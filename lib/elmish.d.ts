declare module 'elmish' {
  export function empty(node: HTMLElement): void;

  export function mount<T>(
    model: T,
    update: (action: string, model: T, data?: any) => T,
    view: (model: T, signal: (action: string, data?: any) => () => void) => Node,
    root_element_id: string,
    subscriptions?: (signal: (action: string, data?: any) => () => void) => void
  ): (action: string, data?: any) => () => void;

  export function add_attributes(attrlist: (string | Function)[], node: HTMLElement): HTMLElement;

  export function append_childnodes(childnodes: Node[], parent: Node): Node;

  export function create_element(type: string, attrlist: string[], childnodes: Node[]): HTMLElement;

  export function section(attrlist: string[], childnodes: Node[]): HTMLElement;
  export function a(attrlist: string[], childnodes: Node[]): HTMLElement;
  export function button(attrlist: string[], childnodes: Node[]): HTMLElement;
  export function div(attrlist: string[], childnodes: Node[]): HTMLElement;
  export function footer(attrlist: string[], childnodes: Node[]): HTMLElement;
  export function header(attrlist: string[], childnodes: Node[]): HTMLElement;
  export function h1(attrlist: string[], childnodes: Node[]): HTMLElement;
  export function input(attrlist: string[], childnodes: Node[]): HTMLElement;
  export function label(attrlist: string[], childnodes: Node[]): HTMLElement;
  export function li(attrlist: string[], childnodes: Node[]): HTMLElement;
  export function span(attrlist: string[], childnodes: Node[]): HTMLElement;
  export function strong(text_str: string): HTMLElement;
  export function text(text: string): Text;
  export function ul(attrlist: string[], childnodes: Node[]): HTMLElement;

  export function route<T extends { hash: string }>(model: T, title: string, hash: string): T;
}
