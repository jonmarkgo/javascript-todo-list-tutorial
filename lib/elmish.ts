import { TodoAction, TodoModel, TodoUpdateFunction, TodoViewFunction, TodoSubscriptionsFunction, TodoSignalFunction } from './types';

// Extend the imported SignalFunction type to match the implementation in this file
type LocalSignalFunction = TodoSignalFunction;

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
export function mount (
  model: TodoModel,
  update: TodoUpdateFunction,
  view: TodoViewFunction,
  root_element_id: string,
  subscriptions?: TodoSubscriptionsFunction
): void {
  const ROOT = document.getElementById(root_element_id); // root DOM element
  if (!ROOT) throw new Error(`Element with id ${root_element_id} not found`);
  const store_name = 'todos-elmish_' + root_element_id; // test-app !== app

  function render (mod: TodoModel, sig: LocalSignalFunction, root: HTMLElement): void {
    localStorage.setItem(store_name, JSON.stringify(mod)); // save the model!
    empty(root); // clear root element (container) before (re)rendering
    root.appendChild(view(mod, sig)) // render view based on model & signal
  }

  const signal: LocalSignalFunction = (action, data?) => {
    return function callback(): void {
      model = JSON.parse(localStorage.getItem(store_name) || '{}') as TodoModel;
      const updatedModel = update(action, model, data); // update model for action
      if (ROOT) {
        render(updatedModel, signal, ROOT);
      }
    };
  };

  model = JSON.parse(localStorage.getItem(store_name) || '{}') as TodoModel || model;
  if (ROOT) {
    render(model, signal, ROOT);
  }
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
export function add_attributes (attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], node: HTMLElement): HTMLElement {
  // console.log(attrlist, node);
  if(attrlist && Array.isArray(attrlist) &&  attrlist.length > 0) {
    attrlist.forEach(function (attr) { // apply all props in array
      // do not attempt to "split" an onclick function as it's not a string!
      if (typeof attr === 'function') {
        node.onclick = attr;
        return node;
      }
      // apply any attributes that are *not* functions (i.e. Strings):
      const a = (attr as string).split('=');
      switch(a[0]) {
        case 'autofocus':
          node.setAttribute('autofocus', 'autofocus');
          node.focus();
          setTimeout(function() { // wait till DOM has rendered then focus()
            node.focus();
          }, 200)
          break;
        case 'checked':
          node.setAttribute('checked', 'true');
          break;
        case 'class':
          node.className = a[1]; // apply one or more CSS classes
          break;
        case 'data-id':
          node.setAttribute('data-id', a[1]); // add data-id e.g: to <li>
          break;
        case 'for':
          node.setAttribute('for', a[1]); // e.g: <label for="toggle-all">
          break;
        case 'href':
          (node as HTMLAnchorElement).href = a[1]; // e.g: <a href="#/active">Active</a>
          break;
        case 'id':
          node.id = a[1]; // apply element id e.g: <input id="toggle-all">
          break;
        case 'placeholder':
          (node as HTMLInputElement).placeholder = a[1]; // add placeholder to <input> element
          break;
        case 'style':
          node.setAttribute("style", a[1]); // <div style="display: block;">
          break;
        case 'type':
          node.setAttribute('type', a[1]); // <input id="go" type="checkbox">
          break;
        case 'value':
          console.log('value:', a[1]);
          (node as HTMLInputElement).value = a[1];
          break;
        default:
          break;
      } // end switch
    });
  }
  return node;
}

/**
/**
 * `append_childnodes` is a convenience function for appending an array
 * of childnodes to a parent DOM node. Useful for nested elements.
 * @param {Array.<HTMLElement>} childnodes array of child elements
 * @param {Object} parent the parent DOM node to append all the children to
 * @return {Object} parent DOM node with appended children
 */
export function append_childnodes (childnodes: (HTMLElement | Text)[], parent: HTMLElement): HTMLElement {
  childnodes.forEach(function (el) {
    parent.appendChild(el);
  });
  return parent;
}

/**
 * `create_element` creates a DOM element with attributes and child nodes.
 * @param {String} tag the HTML tag of the element to be created
 * @param {Array.<String>} attrlist list of attributes to be applied to the element
 * @param {Array.<HTMLElement>} childnodes array of child nodes to be appended
 * @returns {HTMLElement} the created DOM element
 */
export function create_element (tag: string, attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: (HTMLElement | Text)[]): HTMLElement {
  const el = document.createElement(tag);
  add_attributes(attrlist, el);
  return append_childnodes(childnodes, el);
}

export function section (attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: (HTMLElement | Text)[]): HTMLElement {
  return create_element('section', attrlist, childnodes);
}

export function a (attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: (HTMLElement | Text)[]): HTMLElement {
  return create_element('a', attrlist, childnodes);
}

export function button (attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: (HTMLElement | Text)[]): HTMLElement {
  return create_element('button', attrlist, childnodes);
}

export function div (attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: (HTMLElement | Text)[]): HTMLElement {
  return create_element('div', attrlist, childnodes);
}

export function footer (attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: (HTMLElement | Text)[]): HTMLElement {
  return create_element('footer', attrlist, childnodes);
}

export function header (attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: (HTMLElement | Text)[]): HTMLElement {
  return create_element('header', attrlist, childnodes);
}

export function h1 (attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: (HTMLElement | Text)[]): HTMLElement {
  return create_element('h1', attrlist, childnodes);
}

export function input (attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: (HTMLElement | Text)[]): HTMLElement {
  return create_element('input', attrlist, childnodes);
}

export function label (attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: (HTMLElement | Text)[]): HTMLElement {
  return create_element('label', attrlist, childnodes);
}

export function li (attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: (HTMLElement | Text)[]): HTMLElement {
  return create_element('li', attrlist, childnodes);
}

export function span (attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: (HTMLElement | Text)[]): HTMLElement {
  return create_element('span', attrlist, childnodes);
}

export function strong (attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: (HTMLElement | Text)[]): HTMLElement {
  return create_element('strong', attrlist, childnodes);
}

/**
 * `text` creates a Text DOM Element
 * @param {String} text - the text content for the DOM Text Element
 * @returns {HTMLElement} - a span element containing the text
 */
export function text(text: string): HTMLElement {
  const span = document.createElement('span');
  span.textContent = text;
  return span;
}

export function ul (attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], childnodes: (HTMLElement | Text)[]): HTMLElement {
  return create_element('ul', attrlist, childnodes);
}

export function route<T extends { hash?: string }> (model: T, title: string, hash: string): T {
  window.history.pushState(model, title, hash);
  return Object.assign({}, model, { hash: hash.replace('#', '') });
}

// Remove the module.exports section as it's not needed in TypeScript
