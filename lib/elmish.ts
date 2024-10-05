/**
 * `empty` the contents of a given DOM element "node" (before re-rendering).
 * This is the *fastest* way according to: stackoverflow.com/a/3955238/1148249
 * @param  {Object} node the exact DOM node you want to empty the contents of.
 * @example
 * // returns true (once the 'app' node is emptied)
 * const node = document.getElementById('app');
 * empty(node);
 */
function empty (node: HTMLElement): void {
  while (node.lastChild) {
    node.removeChild(node.lastChild);
  }
} // this function produces a (DOM) "mutation" but has no other "side effects".

// Type definitions
type Model = any; // Replace 'any' with a more specific type if possible
type Update<T> = (action: string, model: T, data?: any) => T;
type View<T> = (model: T, signal: SignalFunction<T>) => HTMLElement;
type SignalFunction<T> = (action: string, data?: any, model?: T) => () => void;

/**
 * `mount` mounts the app in the "root" DOM Element.
 */
function mount<T extends Model>(
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
    localStorage.setItem(store_name, JSON.stringify(mod));
    empty(root);
    root.appendChild(view(mod, sig));
  }

  function signal(action: string, data?: any, model?: T): () => void {
    return function callback(): void {
      model = JSON.parse(localStorage.getItem(store_name) || '{}') as T;
      const updatedModel = update(action, model, data);
      if (ROOT) { // Add null check for ROOT
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
function add_attributes(attrlist: (string | Function)[], node: HTMLElement): HTMLElement {
  attrlist.forEach(function (attr) {
    if (typeof attr === 'string' && attr.indexOf('=') > -1) {
      const [key, value] = attr.split('=');
      node.setAttribute(key, value);
    }
    // Fix the type for the onclick event
    if (typeof attr === 'function') {
      node.addEventListener('click', attr as EventListener);
    }
  });
  return node;
}

// Rest of the file remains unchanged

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
function create_element (type: string, attrlist: (string | Function)[], childnodes: HTMLElement[]): HTMLElement {
  return append_childnodes(childnodes,
    add_attributes(attrlist, document.createElement(type))
  );
}

/**
 * section creates a <section> HTML element with attributes and childnodes
 * @param {Array.<String>} attrlist list of attributes to be applied to the node
 * @param {Array.<Object>} childnodes array of child DOM nodes.
 * @return {Object} returns the <section> DOM node with appended children
 * @example
 * // returns <section> DOM element with attributes applied & children appended
 * var section = elmish.section(["class=todoapp"], [h1, input]);
 */
function section (attrlist: (string | Function)[], childnodes: HTMLElement[]): HTMLElement {
  return create_element('section', attrlist, childnodes);
}
// these are a *bit* repetitive, if you know a better way, please open an issue!
function a (attrlist: (string | Function)[], childnodes: HTMLElement[]): HTMLElement {
  return create_element('a', attrlist, childnodes);
}

function button (attrlist: (string | Function)[], childnodes: HTMLElement[]): HTMLElement {
  return create_element('button', attrlist, childnodes);
}

function div (attrlist: (string | Function)[], childnodes: HTMLElement[]): HTMLElement {
  return create_element('div', attrlist, childnodes);
}

function footer (attrlist: (string | Function)[], childnodes: HTMLElement[]): HTMLElement {
  return create_element('footer', attrlist, childnodes);
}

function header (attrlist: (string | Function)[], childnodes: HTMLElement[]): HTMLElement {
  return create_element('header', attrlist, childnodes);
}

function h1 (attrlist: (string | Function)[], childnodes: HTMLElement[]): HTMLElement {
  return create_element('h1', attrlist, childnodes);
}

function input (attrlist: (string | Function)[], childnodes: HTMLElement[]): HTMLElement {
  return create_element('input', attrlist, childnodes);
}

function label (attrlist: (string | Function)[], childnodes: HTMLElement[]): HTMLElement {
  return create_element('label', attrlist, childnodes);
}

function li (attrlist: (string | Function)[], childnodes: HTMLElement[]): HTMLElement {
  return create_element('li', attrlist, childnodes);
}

function span (attrlist: (string | Function)[], childnodes: HTMLElement[]): HTMLElement {
  return create_element('span', attrlist, childnodes);
}

function strong (text_str: string): HTMLElement {
  const el = document.createElement("strong");
  el.innerHTML = text_str;
  return el;
}

function text (text: string): HTMLElement {
  const span = document.createElement('span');
  span.textContent = text;
  return span;
}

function ul (attrlist: (string | Function)[], childnodes: HTMLElement[]): HTMLElement {
  return create_element('ul', attrlist, childnodes);
}

/**
 * route sets the hash portion of the URL in a web browser.
 * @param {Object} model - the current state of the application.
 * @param {String} title - the title of the "page" being navigated to
 * @param {String} hash - the hash (URL) to be navigated to.
 * @return {Object} new_state - state with hash updated to the *new* hash.
 * @example
 * // returns the state object with updated hash value:
 * var new_state = elmish.route(model, 'Active', '#/active');
 */
function route<T extends { hash?: string }> (model: T, title: string, hash: string): T {
  window.location.hash = hash;
  const new_state = JSON.parse(JSON.stringify(model)) as T; // clone model
  new_state.hash = hash;
  return new_state;
}

/* module.exports is needed to run the functions using Node.js for testing! */
/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    add_attributes,
    append_childnodes,
    a,
    button,
    div,
    empty,
    footer,
    input,
    h1,
    header,
    label,
    li,
    mount,
    route,
    section,
    span,
    strong,
    text,
    ul
  }
}

export {
  add_attributes,
  append_childnodes,
  a,
  button,
  div,
  empty,
  footer,
  input,
  h1,
  header,
  label,
  li,
  mount,
  route,
  section,
  span,
  strong,
  text,
  ul
};
