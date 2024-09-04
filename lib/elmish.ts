/**
 * `empty` the contents of a given DOM element "node" (before re-rendering).
 * This is the *fastest* way according to: stackoverflow.com/a/3955238/1148249
 * @param  {HTMLElement} node the exact DOM node you want to empty the contents of.
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

/**
 * `mount` mounts the app in the "root" DOM Element.
 * @param {T} model Initial store of the application's state.
 * @param {Function} update How the application state is updated ("controller")
 * @param {Function} view Function that renders HTML/DOM elements with model.
 * @param {String} root_element_id Root DOM element in which the app is mounted
 * @param {Function} subscriptions Any event listeners the application needs
 * @returns {Function} The signal function for dispatching actions
 */
export function mount<T>(
  model: T,
  update: (action: string, model: T, data?: any) => T,
  view: (model: T, signal: (action: string, data?: any) => () => void) => Node,
  root_element_id: string,
  subscriptions?: (signal: (action: string, data?: any) => () => void) => void
): (action: string, data?: any) => () => void {
  console.log(`[MOUNT] Mounting app with root element id: ${root_element_id}`);
  const ROOT = document.getElementById(root_element_id);
  if (!ROOT) {
    console.error(`[MOUNT] Element with id "${root_element_id}" not found`);
    throw new Error(`Element with id "${root_element_id}" not found`);
  }
  const store_name = 'todos-elmish_' + root_element_id;
  console.log(`[MOUNT] Using localStorage key: ${store_name}`);

  function saveModelToLocalStorage(mod: T): void {
    try {
      const serializedModel = JSON.stringify(mod);
      localStorage.setItem(store_name, serializedModel);
      console.log('[SAVE] Model successfully saved to localStorage:', mod);
    } catch (e) {
      console.error(`[SAVE] Error saving model to localStorage (${store_name}):`, e);
    }
  }

  function getModelFromLocalStorage(): T | null {
    try {
      if (typeof localStorage === 'undefined') {
        console.warn('[GET] localStorage is not available');
        return null;
      }
      const storedModel = localStorage.getItem(store_name);
      if (storedModel === null) {
        console.log(`[GET] No stored model found for ${store_name}`);
        return null;
      }
      const parsedModel = JSON.parse(storedModel) as T;
      console.log('[GET] Retrieved stored model:', parsedModel);
      return parsedModel;
    } catch (e) {
      console.error(`[GET] Error retrieving or parsing model from localStorage (${store_name}):`, e);
      return null;
    }
  }

  function render(mod: T, sig: (action: string, data?: any) => () => void, root: HTMLElement, callback?: () => void): void {
    console.log('[RENDER] Rendering view with model:', mod);
    empty(root);
    const viewResult = view(mod, sig) as Node;
    console.log('[RENDER] View function result:', viewResult);
    root.appendChild(viewResult);
    console.log('[RENDER] View rendered and appended to root');
    saveModelToLocalStorage(mod);
    if (callback) {
      console.log('[RENDER] Scheduling callback');
      setTimeout(() => {
        console.log('[RENDER] Executing callback');
        callback();
      }, 0);
    }
  }

  let currentModel: T;

  function signal(action: string, data?: any): () => void {
    return function callback(): void {
      console.log(`[SIGNAL] Signal called with action: ${action}, data:`, data);
      console.log('[SIGNAL] Current model before update:', currentModel);
      try {
        const updatedModel = update(action, currentModel, data);
        console.log('[SIGNAL] Model updated:', updatedModel);
        if (ROOT) {
          currentModel = updatedModel;
          render(currentModel, signal, ROOT, () => {
            console.log('[RENDER] DOM updated after action:', action);
            console.log('[RENDER] Current model after update:', currentModel);
            saveModelToLocalStorage(currentModel);
          });
        } else {
          console.error('[SIGNAL] Root element is null, cannot render view');
        }
      } catch (e) {
        console.error(`[SIGNAL] Error updating model for action: ${action}`, e);
      }
    };
  }

  // Initialize the model
  const storedModel = getModelFromLocalStorage();
  if (storedModel !== null) {
    console.log('[INIT] Using stored model from localStorage:', storedModel);
    currentModel = storedModel;
  } else {
    console.log(`[INIT] Using provided initial model:`, model);
    currentModel = model;
  }

  try {
    console.log('[INIT] Initial render with model:', currentModel);
    render(currentModel, signal, ROOT);
    if (subscriptions && typeof subscriptions === 'function') {
      console.log('[INIT] Initializing subscriptions');
      subscriptions(signal);
    } else {
      console.log('[INIT] No subscriptions provided');
    }
  } catch (e) {
    console.error('[ERROR] Error during mount process:', e);
    // Implement a basic fallback rendering
    ROOT.innerHTML = '<p>An error occurred while mounting the application.</p>';
    throw e; // Re-throw the error after fallback rendering
  }

  console.log('[MOUNT] Mount process completed, returning signal function');
  return signal; // Return the signal function
}

/**
 * `add_attributes` applies the desired attribute(s) to the specified DOM node.
 * Note: this function is "impure" because it "mutates" the node.
 * However, it is idempotent; the "side effect" is only applied once.
 * @param {Array.<string | Function>} attrlist list of attributes to be applied
 * to the node accepts both String and Function (for event handlers).
 * @param {HTMLElement} node DOM node upon which attribute(s) should be applied
 * @example
 * // returns node with attributes applied
 * input = add_attributes(["type=checkbox", "id=todo1", "checked=true"], input);
 */
export function add_attributes(attrlist: (string | Function)[], node: HTMLElement): HTMLElement {
  if (attrlist && Array.isArray(attrlist) && attrlist.length > 0) {
    attrlist.forEach((attr: string | Function) => {
      if (typeof attr === 'function') {
        node.onclick = attr as EventListener;
        return;
      }
      if (typeof attr !== 'string') {
        console.warn('Invalid attribute type:', attr);
        return;
      }
      const parts = attr.split('=');
      const key = parts[0];
      const value = parts.slice(1).join('=');

      switch(key) {
        case 'autofocus':
          node.setAttribute('autofocus', '');
          node.focus();
          setTimeout(() => { node.focus(); }, 200);
          break;
        case 'checked':
          if (value === 'true') {
            (node as HTMLInputElement).checked = true;
          }
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
          (node as HTMLInputElement).value = value;
          break;
        default:
          if (key.startsWith('on') && typeof (window as any)[key.slice(2)] === 'function') {
            (node as any)[key] = new Function('event', value) as EventListener;
          } else {
            node.setAttribute(key, value);
          }
          break;
      }
    });
  }
  return node;
}

/**
 * `append_childnodes` appends an array of HTML elements to a parent DOM node.
 * @param  {Array.<Node>} childnodes array of child DOM nodes.
 * @param  {Node} parent the "parent" DOM node where children will be added.
 * @return {Node} returns parent DOM node with appended children
 * @example
 * // returns the parent node with the "children" appended
 * var parent = elmish.append_childnodes([div, p, section], parent);
 */
export function append_childnodes(childnodes: Node[], parent: Node): Node {
  if (childnodes && Array.isArray(childnodes) && childnodes.length > 0) {
    childnodes.forEach((el: Node) => { parent.appendChild(el) });
  }
  return parent;
}

/**
 * create_element is a "helper" function to "DRY" HTML element creation code
 * create *any* element with attributes and childnodes.
 * @param {string} type of element to be created e.g: 'div', 'section'
 * @param {Array<string>} attrlist list of attributes to be applied to the node
 * @param {Array<Node>} childnodes array of child DOM nodes.
 * @return {HTMLElement} returns the DOM node with appended children
 * @example
 * // returns the parent node with the "children" appended
 * var div = elmish.create_element('div', ["class=todoapp"], [h1, input]);
 */
export function create_element(type: string, attrlist: Array<string>, childnodes: Array<Node>): HTMLElement {
  return append_childnodes(childnodes,
    add_attributes(attrlist, document.createElement(type))
  ) as HTMLElement;
}

export function section (attrlist: string[], childnodes: Node[]): HTMLElement {
  return create_element('section', attrlist, childnodes);
}

export function a (attrlist: string[], childnodes: Node[]): HTMLElement {
  return create_element('a', attrlist, childnodes);
}

export function button (attrlist: string[], childnodes: Node[]): HTMLElement {
  return create_element('button', attrlist, childnodes);
}

export function div (attrlist: string[], childnodes: Node[]): HTMLElement {
  return create_element('div', attrlist, childnodes);
}

export function footer (attrlist: string[], childnodes: Node[]): HTMLElement {
  return create_element('footer', attrlist, childnodes);
}

export function header (attrlist: string[], childnodes: Node[]): HTMLElement {
  return create_element('header', attrlist, childnodes);
}

export function h1 (attrlist: string[], childnodes: Node[]): HTMLElement {
  return create_element('h1', attrlist, childnodes);
}

export function input (attrlist: string[], childnodes: Node[]): HTMLElement {
  return create_element('input', attrlist, childnodes);
}

export function label (attrlist: string[], childnodes: Node[]): HTMLElement {
  return create_element('label', attrlist, childnodes);
}

export function li (attrlist: string[], childnodes: Node[]): HTMLElement {
  return create_element('li', attrlist, childnodes);
}

export function span (attrlist: string[], childnodes: Node[]): HTMLElement {
  return create_element('span', attrlist, childnodes);
}

export function strong (text_str: string): HTMLElement {
  const el = document.createElement("strong");
  el.innerHTML = text_str;
  return el;
}

export function text (text: string): Text {
  return document.createTextNode(text);
}

export function ul (attrlist: string[], childnodes: Node[]): HTMLElement {
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
export function route<T extends { hash: string }>(model: T, title: string, hash: string): T {
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
