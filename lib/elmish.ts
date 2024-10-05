export namespace Elmish {
  export type AttributeValue = string | ((this: GlobalEventHandlers, ev: MouseEvent) => any);
  export type ChildNode = HTMLElement | Text;
  export type SignalFunction<T> = (action: string, data?: any, model?: T) => () => void;

  /**
   * `empty` the contents of a given DOM element "node" (before re-rendering).
   * This is the *fastest* way according to: stackoverflow.com/a/3955238/1148249
   * @param  {Object} node the exact DOM node you want to empty the contents of.
   * @example
   * // returns true (once the 'app' node is emptied)
   * const node = document.getElementById('app');
   * empty(node);
   */
  export function empty(node: HTMLElement): void {
    while (node.lastChild) {
      node.removeChild(node.lastChild);
    }
  } // this function produces a (DOM) "mutation" but has no other "side effects".

  // Type definitions
  export type Model = any; // Replace 'any' with a more specific type if possible
  export type Update<T> = (action: string, model: T, data?: any) => T;
  export type View<T> = (model: T, signal: SignalFunction<T>) => HTMLElement;

  /**
   * `mount` mounts the app in the "root" DOM Element.
   * @param {Object} model store of the application's state.
   * @param {Function} update how the application state is updated ("controller")
   * @param {Function} view function that renders HTML/DOM elements with model.
   * @param {String} root_element_id root DOM element in which the app is mounted
   * @param {Function} subscriptions any event listeners the application needs
   */
  export function mount<T extends Model>(
    model: T,
    update: Update<T>,
    view: View<T>,
    root_element_id: string,
    subscriptions?: (signal: SignalFunction<T>) => void
  ): void {
    const ROOT = document.getElementById(root_element_id);
    if (!ROOT) throw new Error(`Element with id ${root_element_id} not found`);
    const store_name = 'todos-elmish_' + root_element_id;

    function render(mod: T, sig: SignalFunction<T>, root: HTMLElement): void {
      localStorage.setItem(store_name, JSON.stringify(mod)); // save the model!
      empty(root); // clear root element (container) before (re)rendering
      root.appendChild(view(mod, sig)); // render view based on model & signal
    }

    function signal(action: string, data?: any, model?: T): () => void {
      return function callback(): void {
        model = JSON.parse(localStorage.getItem(store_name) || '{}') as T;
        const updatedModel = update(action, model, data); // update model for action
        if (ROOT) {
          render(updatedModel, signal, ROOT);
        }
      };
    }

    model = JSON.parse(localStorage.getItem(store_name) || '{}') as T || model;
    render(model, signal, ROOT);
    if (subscriptions && typeof subscriptions === 'function') {
      subscriptions(signal);
    }
  }

  /**
  * `add_attributes` applies the desired attribute(s) to the specified DOM node.
  * Note: this function is "impure" because it "mutates" the node.
  * however it is idempotent; the "side effect" is only applied once.
  * @param {Array.<String>/<Function>} attrlist list of attributes to be applied
  * to the node accepts both String and Function (for onclick handlers).
  * @param {Object} node DOM node upon which attribute(s) should be applied
  * @example
  * // returns node with attributes applied
  * input = add_attributes(["type=checkbox", "id=todo1", "checked=true"], input);
  */
  export function add_attributes(attrlist: AttributeValue[], node: HTMLElement): HTMLElement {
    console.log('Attributes received:', attrlist);
    if(attrlist && Array.isArray(attrlist) &&  attrlist.length > 0) {
      attrlist.forEach(function (attr) {
        if (typeof attr === 'function') {
          node.onclick = attr;
          return;
        }
        if (typeof attr !== 'string') {
          console.error('Invalid attribute type:', attr);
          return;
        }
        if (attr === '') {
          console.error('Empty string attribute received');
          return;
        }
        const a = attr.split('=');
        if (a.length !== 2) {
          console.error('Invalid attribute format:', attr);
          return;
        }
        const [key, value] = a;
        switch(key) {
          case 'autofocus':
            node.setAttribute('autofocus', 'autofocus');
            node.focus();
            setTimeout(function() {
              node.focus();
            }, 200)
            break;
          case 'checked':
            node.setAttribute('checked', 'true');
            break;
          case 'class':
            node.className = value;
            break;
          case 'data-id':
            node.setAttribute('data-id', value);
            break;
          case 'for':
            node.setAttribute('for', value);
            break;
          case 'href':
            (node as HTMLAnchorElement).href = value;
            break;
          case 'id':
            node.id = value;
            break;
          case 'placeholder':
            (node as HTMLInputElement).placeholder = value;
            break;
          case 'style':
            node.setAttribute("style", value);
            break;
          case 'type':
            node.setAttribute('type', value);
            break;
          case 'value':
            console.log('value:', value);
            (node as HTMLInputElement).value = value;
            break;
          default:
            node.setAttribute(key, value);
            break;
        }
      });
    }
    return node;
  }

  /**
   * `append_childnodes` appends an array of HTML elements to a parent DOM node.
   * @param  {Array.<Object>} childnodes array of child DOM nodes.
   * @param  {Object} parent the "parent" DOM node where children will be added.
   * @return {Object} returns parent DOM node with appended children
   * @example
   * // returns the parent node with the "children" appended
   * var parent = elmish.append_childnodes([div, p, section], parent);
   */
  export function append_childnodes(childnodes: ChildNode[], parent: HTMLElement): HTMLElement {
    if(childnodes && Array.isArray(childnodes) && childnodes.length > 0) {
      childnodes.forEach(function (el) { parent.appendChild(el) });
    }
    return parent;
  }

  /**
   * create_element is a "helper" function to "DRY" HTML element creation code
   * creat *any* element with attributes and childnodes.
   * @param {String} type of element to be created e.g: 'div', 'section'
   * @param {Array.<String>} attrlist list of attributes to be applied to the node
   * @param {Array.<Object>} childnodes array of child DOM nodes.
   * @return {Object} returns the <section> DOM node with appended children
   * @example
   * // returns the parent node with the "children" appended
   * var div = elmish.create_element('div', ["class=todoapp"], [h1, input]);
   */
  export function create_element(type: string, attrlist: AttributeValue[], childnodes: ChildNode[]): HTMLElement {
    return append_childnodes(childnodes,
      add_attributes(attrlist, document.createElement(type))
    );
  }

  export function text(content: string): Text {
    return document.createTextNode(content);
  }

  // Helper functions to create HTML elements:
  export function section(attrlist: AttributeValue[], childnodes: ChildNode[]): HTMLElement {
    return create_element('section', attrlist, childnodes);
  }

  export function a(attrlist: AttributeValue[], childnodes: ChildNode[]): HTMLElement {
    return create_element('a', attrlist, childnodes);
  }

  export function button(attrlist: AttributeValue[], childnodes: ChildNode[]): HTMLElement {
    return create_element('button', attrlist, childnodes);
  }

  export function div(attrlist: AttributeValue[], childnodes: ChildNode[]): HTMLElement {
    return create_element('div', attrlist, childnodes);
  }

  export function footer(attrlist: AttributeValue[], childnodes: ChildNode[]): HTMLElement {
    return create_element('footer', attrlist, childnodes);
  }

  export function header(attrlist: AttributeValue[], childnodes: ChildNode[]): HTMLElement {
    return create_element('header', attrlist, childnodes);
  }

  export function h1(attrlist: AttributeValue[], childnodes: ChildNode[]): HTMLElement {
    return create_element('h1', attrlist, childnodes);
  }

  export function input(attrlist: AttributeValue[], childnodes: ChildNode[]): HTMLElement {
    return create_element('input', attrlist, childnodes);
  }

  export function label(attrlist: AttributeValue[], childnodes: ChildNode[]): HTMLElement {
    return create_element('label', attrlist, childnodes);
  }

  export function li(attrlist: AttributeValue[], childnodes: ChildNode[]): HTMLElement {
    return create_element('li', attrlist, childnodes);
  }

  export function span(attrlist: AttributeValue[], childnodes: ChildNode[]): HTMLElement {
    return create_element('span', attrlist, childnodes);
  }

  export function strong(attrlist: AttributeValue[], childnodes: ChildNode[]): HTMLElement {
    return create_element('strong', attrlist, childnodes);
  }

  export function ul(attrlist: AttributeValue[], childnodes: ChildNode[]): HTMLElement {
    return create_element('ul', attrlist, childnodes);
  }

  export function on_click(handler: (ev: MouseEvent) => void): AttributeValue {
    return function(this: GlobalEventHandlers, ev: MouseEvent) {
      ev.preventDefault();
      handler(ev);
    };
  }

  export function route(path: string): boolean {
    return window.location.hash.slice(1) === path;
  }
}

export default Elmish;
