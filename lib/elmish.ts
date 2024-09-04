/**
 * `empty` the contents of a given DOM element "node" (before re-rendering).
 * This is the *fastest* way according to: stackoverflow.com/a/3955238/1148249
 * @param  {HTMLElement} node the exact DOM node you want to empty the contents of.
 * @example
 * // returns true (once the 'app' node is emptied)
 * const node = document.getElementById('app');
 * empty(node);
 */
function empty(node: HTMLElement): void {
  while (node.lastChild) {
    node.removeChild(node.lastChild);
  }
}

/**
 * `mount` mounts the app in the "root" DOM Element.
 * @param {any} model store of the application's state.
 * @param {Function} update how the application state is updated ("controller")
 * @param {Function} view function that renders HTML/DOM elements with model.
 * @param {string} root_element_id root DOM element in which the app is mounted
 * @param {Function} subscriptions any event listeners the application needs
 */
function mount(
  model: any,
  update: (action: string, model: any, data?: any) => any,
  view: (model: any, signal: Function) => HTMLElement,
  root_element_id: string,
  subscriptions?: (signal: Function) => void
): void {
  const ROOT = document.getElementById(root_element_id) as HTMLElement;
  const store_name = 'todos-elmish_' + root_element_id;

  function render(mod: any, sig: Function, root: HTMLElement): void {
    localStorage.setItem(store_name, JSON.stringify(mod));
    empty(root);
    root.appendChild(view(mod, sig));
  }

  function signal(action: string, data: any, model: any): () => void {
    return function callback(): void {
      model = JSON.parse(localStorage.getItem(store_name) || '{}');
      const updatedModel = update(action, model, data);
      render(updatedModel, signal, ROOT);
    };
  }

  model = JSON.parse(localStorage.getItem(store_name) || '{}') || model;
  render(model, signal, ROOT);
  if (subscriptions && typeof subscriptions === 'function') {
    subscriptions(signal);
  }
}

/**
 * `add_attributes` applies the desired attribute(s) to the specified DOM node.
 * Note: this function is "impure" because it "mutates" the node.
 * however it is idempotent; the "side effect" is only applied once.
 * @param {Array<string | ((this: GlobalEventHandlers, ev: MouseEvent) => any)>} attrlist list of attributes to be applied
 * to the node accepts both String and Function (for onclick handlers).
 * @param {HTMLElement} node DOM node upon which attribute(s) should be applied
 * @example
 * // returns node with attributes applied
 * input = add_attributes(["type=checkbox", "id=todo1", "checked=true"], input);
 */
function add_attributes(attrlist: Array<string | ((this: GlobalEventHandlers, ev: MouseEvent) => any)>, node: HTMLElement): HTMLElement {
  if (attrlist && Array.isArray(attrlist) && attrlist.length > 0) {
    attrlist.forEach((attr) => {
      if (typeof attr === 'function') {
        node.onclick = attr as (this: GlobalEventHandlers, ev: MouseEvent) => any;
        return node;
      }
      const a = (attr as string).split('=');
      switch (a[0]) {
        case 'autofocus':
          node.setAttribute('autofocus', 'autofocus');
          node.focus();
          setTimeout(() => {
            node.focus();
          }, 200);
          break;
        case 'checked':
          node.setAttribute('checked', 'true');
          break;
        case 'class':
          node.className = a[1];
          break;
        case 'data-id':
          node.setAttribute('data-id', a[1]);
          break;
        case 'for':
          node.setAttribute('for', a[1]);
          break;
        case 'href':
          (node as HTMLAnchorElement).href = a[1];
          break;
        case 'id':
          node.id = a[1];
          break;
        case 'placeholder':
          (node as HTMLInputElement).placeholder = a[1];
          break;
        case 'style':
          node.setAttribute('style', a[1]);
          break;
        case 'type':
          node.setAttribute('type', a[1]);
          break;
        case 'value':
          console.log('value:', a[1]);
          (node as HTMLInputElement).value = a[1];
          break;
      }
    });
  }
  return node;
}

/**
 * `append_childnodes` appends an array of HTML elements to a parent DOM node.
 * @param  {Array<HTMLElement>} childnodes array of child DOM nodes.
 * @param  {HTMLElement} parent the "parent" DOM node where children will be added.
 * @return {HTMLElement} returns parent DOM node with appended children
 * @example
 * // returns the parent node with the "children" appended
 * var parent = elmish.append_childnodes([div, p, section], parent);
 */
function append_childnodes(childnodes: Array<HTMLElement>, parent: HTMLElement): HTMLElement {
  if (childnodes && Array.isArray(childnodes) && childnodes.length > 0) {
    childnodes.forEach((el) => {
      parent.appendChild(el);
    });
  }
  return parent;
}

/**
 * create_element is a "helper" function to "DRY" HTML element creation code
 * create *any* element with attributes and childnodes.
 * @param {string} type of element to be created e.g: 'div', 'section'
 * @param {Array<string | ((this: GlobalEventHandlers, ev: MouseEvent) => any)>} attrlist list of attributes to be applied to the node
 * @param {Array<HTMLElement>} childnodes array of child DOM nodes.
 * @return {HTMLElement} returns the DOM node with appended children
 * @example
 * // returns the parent node with the "children" appended
 * var div = elmish.create_element('div', ["class=todoapp"], [h1, input]);
 */
function create_element(type: string, attrlist: Array<string | ((this: GlobalEventHandlers, ev: MouseEvent) => any)>, childnodes: Array<HTMLElement>): HTMLElement {
  return append_childnodes(
    childnodes,
    add_attributes(attrlist, document.createElement(type))
  );
}

/**
 * section creates a <section> HTML element with attributes and childnodes
 * @param {Array<string | ((this: GlobalEventHandlers, ev: MouseEvent) => any)>} attrlist list of attributes to be applied to the node
 * @param {Array<HTMLElement>} childnodes array of child DOM nodes.
 * @return {HTMLElement} returns the <section> DOM node with appended children
 * @example
 * // returns <section> DOM element with attributes applied & children appended
 * var section = elmish.section(["class=todoapp"], [h1, input]);
 */
function section(attrlist: Array<string | ((this: GlobalEventHandlers, ev: MouseEvent) => any)>, childnodes: Array<HTMLElement>): HTMLElement {
  return create_element('section', attrlist, childnodes);
}

function a(attrlist: Array<string | ((this: GlobalEventHandlers, ev: MouseEvent) => any)>, childnodes: Array<HTMLElement>): HTMLElement {
  return create_element('a', attrlist, childnodes);
}

function button(attrlist: Array<string | ((this: GlobalEventHandlers, ev: MouseEvent) => any)>, childnodes: Array<HTMLElement>): HTMLElement {
  return create_element('button', attrlist, childnodes);
}

function div(attrlist: Array<string | ((this: GlobalEventHandlers, ev: MouseEvent) => any)>, childnodes: Array<HTMLElement>): HTMLElement {
  return create_element('div', attrlist, childnodes);
}

function footer(attrlist: Array<string | ((this: GlobalEventHandlers, ev: MouseEvent) => any)>, childnodes: Array<HTMLElement>): HTMLElement {
  return create_element('footer', attrlist, childnodes);
}

function header(attrlist: Array<string | ((this: GlobalEventHandlers, ev: MouseEvent) => any)>, childnodes: Array<HTMLElement>): HTMLElement {
  return create_element('header', attrlist, childnodes);
}

function h1(attrlist: Array<string | ((this: GlobalEventHandlers, ev: MouseEvent) => any)>, childnodes: Array<HTMLElement>): HTMLElement {
  return create_element('h1', attrlist, childnodes);
}

function input(attrlist: Array<string | ((this: GlobalEventHandlers, ev: MouseEvent) => any)>, childnodes: Array<HTMLElement>): HTMLInputElement {
  return create_element('input', attrlist, childnodes) as HTMLInputElement;
}

function label(attrlist: Array<string | ((this: GlobalEventHandlers, ev: MouseEvent) => any)>, childnodes: Array<HTMLElement>): HTMLLabelElement {
  return create_element('label', attrlist, childnodes) as HTMLLabelElement;
}

function li(attrlist: Array<string | ((this: GlobalEventHandlers, ev: MouseEvent) => any)>, childnodes: Array<HTMLElement>): HTMLLIElement {
  return create_element('li', attrlist, childnodes) as HTMLLIElement;
}

function span(attrlist: Array<string | ((this: GlobalEventHandlers, ev: MouseEvent) => any)>, childnodes: Array<HTMLElement>): HTMLSpanElement {
  return create_element('span', attrlist, childnodes) as HTMLSpanElement;
}

function strong(text_str: string): HTMLElement {
  const el = document.createElement("strong");
  el.innerHTML = text_str;
  return el;
}

function text(text: string): Text {
  return document.createTextNode(text);
}

function ul(attrlist: Array<string | ((this: GlobalEventHandlers, ev: MouseEvent) => any)>, childnodes: Array<HTMLElement>): HTMLUListElement {
  return create_element('ul', attrlist, childnodes) as HTMLUListElement;
}

/**
 * route sets the hash portion of the URL in a web browser.
 * @param {any} model - the current state of the application.
 * @param {string} title - the title of the "page" being navigated to
 * @param {string} hash - the hash (URL) to be navigated to.
 * @return {any} new_state - state with hash updated to the *new* hash.
 * @example
 * // returns the state object with updated hash value:
 * var new_state = elmish.route(model, 'Active', '#/active');
 */
function route(model: any, title: string, hash: string): any {
  window.location.hash = hash;
  const new_state = JSON.parse(JSON.stringify(model));
  new_state.hash = hash;
  return new_state;
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
