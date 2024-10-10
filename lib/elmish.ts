export interface Model {
  counters: number[];
}

export type Action = 'inc' | 'dec' | 'reset';

export function update(model: Model, action?: Action): Model {
  // Implementation details to be added later
  return model;
}

export function view(model: Model): HTMLElement {
  // Implementation details to be added later
  return document.createElement('div');
}

/**
 * `empty` the contents of a given DOM element "node" (before re-rendering).

export type Action = 'inc' | 'dec' | 'reset';

/**
 * `empty` the contents of a given DOM element "node" (before re-rendering).
 * This is the *fastest* way according to: stackoverflow.com/a/3955238/1148249
 * @param  {Object} node the exact DOM node you want to empty the contents of.
 * @example
 * // returns true (once the 'app' node is emptied)
 * const node = document.getElementById('app');
 * empty(node);
 */
export function empty (node: HTMLElement): void {
  while (node.lastChild) {
    node.removeChild(node.lastChild);
  }
} // this function produces a (DOM) "mutation" but has no other "side effects".

/**
 * `mount` mounts the app in the "root" DOM Element.
 * @param {Object} model store of the application's state.
 * @param {Function} update how the application state is updated ("controller")
 * @param {Function} view function that renders HTML/DOM elements with model.
 * @param {String} root_element_id root DOM element in which the app is mounted
 * @param {Function} subscriptions any event listeners the application needs
 */
export function mount<T> (
  model: T,
  update: (action: string, model: T, data?: any) => T,
  view: (model: T, signal: SignalFunction<T>) => HTMLElement,
  root_element_id: string,
  subscriptions?: (signal: SignalFunction<T>) => void
): void {
  const ROOT = document.getElementById(root_element_id); // root DOM element
  if (!ROOT) throw new Error(`Element with id ${root_element_id} not found`);
  const store_name = 'todos-elmish_' + root_element_id; // test-app !== app

  function render (mod: T, sig: SignalFunction<T>, root: HTMLElement): void {
    localStorage.setItem(store_name, JSON.stringify(mod)); // save the model!
    empty(root); // clear root element (container) before (re)rendering
    root.appendChild(view(mod, sig)) // render view based on model & signal
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
  if (ROOT) {
    render(model, signal, ROOT);
  }
  if (subscriptions && typeof subscriptions === 'function') {
    subscriptions(signal);
  }
}

type SignalFunction<T> = (action: string, data?: any, model?: T) => () => void;

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
export function add_attributes (attrlist: string[], el: HTMLElement): HTMLElement {
  attrlist.forEach(function (attr) {
    const a = attr.split('=');
    switch (a[0]) {
      case 'autofocus':
        el.setAttribute(a[0], a[0]);
        setTimeout(function () { // this should "just work" in JS ... ¯\_(ツ)_/¯
          el.focus();
        }, 200);
        break;
      case 'class':
        el.className = a[1];
        break;
      case 'data-id':
        el.setAttribute('data-id', a[1]);
        break;
      case 'for':
        el.setAttribute('for', a[1]);
        break;
      case 'href':
        el.setAttribute('href', a[1]);
        break;
      case 'id':
        el.id = a[1];
        break;
      case 'placeholder':
        el.setAttribute('placeholder', a[1]);
        break;
      case 'style':
        el.setAttribute('style', a[1]);
        break;
      case 'type':
        el.setAttribute('type', a[1]);
        break;
      case 'checked':
        if (a[1] === 'true') {
          (el as HTMLInputElement).checked = true;
        }
        break;
      default:
        break;
    }
  });
  return el;
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
function append_childnodes (childnodes: HTMLElement[], parent: HTMLElement): HTMLElement {
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
function create_element (type: string, attrlist: string[], childnodes: HTMLElement[]): HTMLElement {
  return append_childnodes(childnodes,
    add_attributes(attrlist, document.createElement(type))
  );
}

export function section (attrlist: string[], childnodes: HTMLElement[]): HTMLElement {
  return create_element('section', attrlist, childnodes);
}

export function a (attrlist: string[], childnodes: HTMLElement[]): HTMLElement {
  return create_element('a', attrlist, childnodes);
}

export function button (attrlist: string[], childnodes: HTMLElement[]): HTMLElement {
  return create_element('button', attrlist, childnodes);
}

export function div (attrlist: string[], childnodes: HTMLElement[]): HTMLElement {
  return create_element('div', attrlist, childnodes);
}

export function footer (attrlist: string[], childnodes: HTMLElement[]): HTMLElement {
  return create_element('footer', attrlist, childnodes);
}

export function header (attrlist: string[], childnodes: HTMLElement[]): HTMLElement {
  return create_element('header', attrlist, childnodes);
}

export function h1 (attrlist: string[], childnodes: HTMLElement[]): HTMLElement {
  return create_element('h1', attrlist, childnodes);
}

export function input (attrlist: string[], childnodes: HTMLElement[]): HTMLElement {
  return create_element('input', attrlist, childnodes);
}

export function label (attrlist: string[], childnodes: HTMLElement[]): HTMLElement {
  return create_element('label', attrlist, childnodes);
}

export function li (attrlist: string[], childnodes: HTMLElement[]): HTMLElement {
  return create_element('li', attrlist, childnodes);
}

export function span (attrlist: string[], childnodes: HTMLElement[]): HTMLElement {
  return create_element('span', attrlist, childnodes);
}

export function strong (attrlist: string[], childnodes: HTMLElement[]): HTMLElement {
  return create_element('strong', attrlist, childnodes);
}

export function text (text: string): Text {
  return document.createTextNode(text);
}

export function ul (attrlist: string[], childnodes: HTMLElement[]): HTMLElement {
  return create_element('ul', attrlist, childnodes);
}

export function route (url: string): void {
  window.location.hash = url;
}

// Remove the module.exports section as it's not needed in TypeScript
