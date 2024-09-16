import { TodoState, UpdateFunction, ViewFunction } from './types.js';

// Explicitly export all functions used in todo-app.ts
export {
  empty,
  mount,
  add_attributes,
  append_childnodes,
  create_element,
  section,
  a,
  button,
  div,
  footer,
  header,
  h1,
  input,
  label,
  li,
  span,
  strong,
  text,
  ul,
  route
};

/**
 * `empty` the contents of a given DOM element "node" (before re-rendering).
 * This is the *fastest* way according to: stackoverflow.com/a/3955238/1148249
 * @param  {HTMLElement} node the exact DOM node you want to empty the contents of.
 * @example
 * // returns void (once the 'app' node is emptied)
 * const node = document.getElementById('app');
 * if (node) empty(node);
 */
function empty(node: HTMLElement): void {
  while (node.lastChild) {
    node.removeChild(node.lastChild);
  }
} // this function produces a (DOM) "mutation" but has no other "side effects".

/**
 * `mount` mounts the app in the "root" DOM Element.
 * @param {TodoState} initialModel initial store of the application's state.
 * @param {UpdateFunction} update how the application state is updated ("controller")
 * @param {ViewFunction} view function that renders HTML/DOM elements with model.
 * @param {string} root_element_id root DOM element in which the app is mounted
 * @param {Function} subscriptions any event listeners the application needs
 */
function mount(
  initialModel: TodoState,
  update: UpdateFunction,
  view: ViewFunction,
  root_element_id: string,
  subscriptions?: (signal: (action: string, data?: any) => void) => void
): void {
  const ROOT = document.getElementById(root_element_id);
  if (!ROOT) throw new Error(`Root element with id ${root_element_id} not found`);

  const store_name = 'todos-elmish_' + root_element_id;

  function render(mod: TodoState, sig: (action: string, data?: any) => void, root: HTMLElement): void {
    empty(root);
    root.appendChild(view(mod, sig));
  }

  let currentModel: TodoState;

  function signal(action: string, data?: any): void {
    const updatedModel = update(action, currentModel, data);
    currentModel = updatedModel;
    localStorage.setItem(store_name, JSON.stringify(currentModel));
    if (ROOT) {
      render(currentModel, signal, ROOT);
    }
  }

  // Initialize the model from localStorage or use the initial model
  const storedModel = localStorage.getItem(store_name);
  currentModel = storedModel ? JSON.parse(storedModel) : initialModel;

  // Initial render
  render(currentModel, signal, ROOT);

  // Save initial state to localStorage
  localStorage.setItem(store_name, JSON.stringify(currentModel));

  if (subscriptions && typeof subscriptions === 'function') {
    subscriptions(signal);
  }
}

/**
 * `add_attributes` applies the desired attribute(s) to the specified DOM node.
 * Note: this function is "impure" because it "mutates" the node.
 * however it is idempotent; the "side effect" is only applied once.
 * @param {Array<string | ((event: MouseEvent) => void) | Function>} attrlist list of attributes to be applied
 * to the node accepts both String and Function (for onclick handlers).
 * @param {HTMLElement} node DOM node upon which attribute(s) should be applied
 * @example
 * // returns node with attributes applied
 * input = add_attributes(["type=checkbox", "id=todo1", "checked=true"], input);
 */
function add_attributes(attrlist: Array<string | ((event: MouseEvent) => void) | Function>, node: HTMLElement): HTMLElement {
  if (attrlist && Array.isArray(attrlist) && attrlist.length > 0) {
    attrlist.forEach((attr) => { // apply all props in array
      // do not attempt to "split" an onclick function as it's not a string!
      if (typeof attr === 'function') {
        node.onclick = attr as (event: MouseEvent) => void;
        return;
      }
      // apply any attributes that are *not* functions (i.e. Strings):
      const [key, value] = (attr as string).split('=');
      switch(key) {
        case 'autofocus':
          node.setAttribute('autofocus', 'autofocus');
          node.focus();
          setTimeout(() => { // wait till DOM has rendered then focus()
            node.focus();
          }, 200);
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
          node.setAttribute('style', value);
          break;
        case 'type':
          node.setAttribute('type', value);
          break;
        case 'value':
          console.log('value:', value);
          (node as HTMLInputElement).value = value;
          break;
        default:
          break;
      }
    });
  }
  return node;
}

/**
 * `append_childnodes` appends an array of HTML elements or Text nodes to a parent DOM node.
 * @param  {Array<HTMLElement | Text>} childnodes array of child DOM nodes.
 * @param  {HTMLElement} parent the "parent" DOM node where children will be added.
 * @return {HTMLElement} returns parent DOM node with appended children
 * @example
 * // returns the parent node with the "children" appended
 * var parent = elmish.append_childnodes([div, p, section], parent);
 */
function append_childnodes(childnodes: Array<HTMLElement | Text>, parent: HTMLElement): HTMLElement {
  if (childnodes && Array.isArray(childnodes) && childnodes.length > 0) {
    childnodes.forEach((el) => { parent.appendChild(el) });
  }
  return parent;
}

/**
 * create_element is a "helper" function to "DRY" HTML element creation code
 * create *any* element with attributes and childnodes.
 * @param {string} type of element to be created e.g: 'div', 'section'
 * @param {Array<string | ((event: MouseEvent) => void) | Function>} attrlist list of attributes to be applied to the node
 * @param {Array<HTMLElement | Text>} childnodes array of child DOM nodes.
 * @return {HTMLElement} returns the DOM node with appended children
 * @example
 * // returns the parent node with the "children" appended
 * var div = elmish.create_element('div', ["class=todoapp"], [h1, input]);
 */
function create_element(type: string, attrlist: Array<string | ((event: MouseEvent) => void) | Function>, childnodes: Array<HTMLElement | Text>): HTMLElement {
  return append_childnodes(childnodes,
    add_attributes(attrlist, document.createElement(type))
  );
}

/**
 * section creates a <section> HTML element with attributes and childnodes
 * @param {Array<string | ((event: MouseEvent) => void)>} attrlist list of attributes to be applied to the node
 * @param {Array<HTMLElement | Text>} childnodes array of child DOM nodes.
 * @return {HTMLElement} returns the <section> DOM node with appended children
 * @example
 * // returns <section> DOM element with attributes applied & children appended
 * var section = elmish.section(["class=todoapp"], [h1, input]);
 */
function section(attrlist: Array<string | ((event: MouseEvent) => void)>, childnodes: Array<HTMLElement | Text>): HTMLElement {
  return create_element('section', attrlist, childnodes);
}

// Helper functions for creating various HTML elements
function a(attrlist: Array<string | ((event: MouseEvent) => void)>, childnodes: Array<HTMLElement | Text>): HTMLElement {
  return create_element('a', attrlist, childnodes);
}

function button(attrlist: Array<string | ((event: MouseEvent) => void)>, childnodes: Array<HTMLElement | Text>): HTMLElement {
  return create_element('button', attrlist, childnodes);
}

function div(attrlist: Array<string | ((event: MouseEvent) => void)>, childnodes: Array<HTMLElement | Text>): HTMLElement {
  return create_element('div', attrlist, childnodes);
}

function footer(attrlist: Array<string | ((event: MouseEvent) => void)>, childnodes: Array<HTMLElement | Text>): HTMLElement {
  return create_element('footer', attrlist, childnodes);
}

function header(attrlist: Array<string | ((event: MouseEvent) => void)>, childnodes: Array<HTMLElement | Text>): HTMLElement {
  return create_element('header', attrlist, childnodes);
}

function h1(attrlist: Array<string | ((event: MouseEvent) => void)>, childnodes: Array<HTMLElement | Text>): HTMLElement {
  return create_element('h1', attrlist, childnodes);
}

function input(attrlist: Array<string | ((event: MouseEvent) => void)>, childnodes: Array<HTMLElement | Text>): HTMLElement {
  return create_element('input', attrlist, childnodes);
}

function label(attrlist: Array<string | ((event: MouseEvent) => void)>, childnodes: Array<HTMLElement | Text>): HTMLElement {
  return create_element('label', attrlist, childnodes);
}

function li(attrlist: Array<string | ((event: MouseEvent) => void)>, childnodes: Array<HTMLElement | Text>): HTMLElement {
  return create_element('li', attrlist, childnodes);
}

function span(attrlist: Array<string | ((event: MouseEvent) => void)>, childnodes: Array<HTMLElement | Text>): HTMLElement {
  return create_element('span', attrlist, childnodes);
}

function strong(text_str: string): HTMLElement {
  const el = document.createElement("strong");
  el.innerHTML = text_str;
  return el;
}

function text(text: string): Text {
  return document.createTextNode(text);
}

function ul(attrlist: Array<string | ((event: MouseEvent) => void)>, childnodes: Array<HTMLElement | Text>): HTMLElement {
  return create_element('ul', attrlist, childnodes);
}

/**
 * route sets the hash portion of the URL in a web browser.
 * @param {TodoState} model - the current state of the application.
 * @param {string} title - the title of the "page" being navigated to
 * @param {string} hash - the hash (URL) to be navigated to.
 * @return {TodoState} new_state - state with hash updated to the *new* hash.
 * @example
 * // returns the state object with updated hash value:
 * var new_state = elmish.route(model, 'Active', '#/active');
 */
function route(model: TodoState, title: string, hash: string): TodoState {
  window.location.hash = hash;
  const new_state: TodoState = JSON.parse(JSON.stringify(model)); // clone model
  new_state.hash = hash;
  return new_state;
}
