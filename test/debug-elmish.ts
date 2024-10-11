import { SignalFunction } from './mock-types';

console.log('Debug: Loading debug-elmish.ts');

// Mock version of the add_attributes function
function add_attributes(node: HTMLElement, attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[]): HTMLElement {
  console.log('Debug: add_attributes called with:', { node, attrlist });
  if(attrlist && Array.isArray(attrlist) && attrlist.length > 0) {
    attrlist.forEach(function (attr) {
      console.log('Debug: Processing attribute:', attr);
      if (typeof attr === 'function') {
        node.onclick = attr;
        return;
      }
      if (typeof attr !== 'string') {
        console.log('Debug: Unexpected attribute type:', typeof attr);
        return;
      }
      const a = attr.split('=');
      if (a.length < 2) {
        console.log('Debug: Invalid attribute format:', attr);
        return;
      }
      switch(a[0]) {
        case 'class':
          node.className = a[1];
          break;
        case 'value':
          (node as HTMLInputElement).value = a[1];
          break;
        case 'checked':
          (node as HTMLInputElement).checked = a[1] === 'true';
          break;
        default:
          node.setAttribute(a[0], a[1].replace(/'/g, '')); // remove quotes
      }
    });
  }
  return node;
}

// Mock version of the create_element function
export function create_element(tag: string, attributes: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], children: (HTMLElement | string)[]): HTMLElement {
  console.log('Debug: create_element called with:', { tag, attributes, children });
  const el = document.createElement(tag);
  add_attributes(el, attributes);
  children.forEach(child => {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else {
      el.appendChild(child);
    }
  });
  return el;
}

// Export other necessary functions to mimic elmish.ts
export const empty = (node: HTMLElement): void => {
  console.log('Debug: empty called with:', node);
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
};

export const mount = <T extends object>(
  model: T,
  update: (action: string, model: T, data?: any) => T,
  view: (model: T, signal: SignalFunction<T>) => HTMLElement,
  root_element_id: string,
  subscriptions?: (signal: SignalFunction<T>) => void
): void => {
  console.log('Debug: mount called with:', { model, root_element_id });
  const ROOT = document.getElementById(root_element_id);
  if (!ROOT) throw new Error(`Element with id ${root_element_id} not found`);
  const store_name = 'todos-elmish_' + root_element_id;

  function render(mod: T, sig: SignalFunction<T>, root: HTMLElement): void {
    console.log('Debug: render called with:', { mod, root });
    localStorage.setItem(store_name, JSON.stringify(mod));
    empty(root);
    root.appendChild(view(mod, sig));
  }

  function signal(action: string, data?: any, model?: T): () => void {
    return function callback(): void {
      console.log('Debug: signal callback called for action:', action);
      model = JSON.parse(localStorage.getItem(store_name) || '{}') as T;
      const updatedModel = update(action, model, data);
      if (ROOT) {
        render(updatedModel, signal, ROOT);
      }
    };
  }

  const storedModel = JSON.parse(localStorage.getItem(store_name) || '{}') as T;
  model = Object.keys(storedModel).length > 0 ? storedModel : model;

  if (ROOT) {
    render(model, signal, ROOT);
  }
  if (subscriptions && typeof subscriptions === 'function') {
    subscriptions(signal);
  }
};

// Add any missing functions from the core elmish.ts
export const input = (attributes: string[]): HTMLInputElement => {
  return create_element('input', attributes, []) as HTMLInputElement;
};

export const div = (attributes: string[], children: (HTMLElement | string)[]): HTMLDivElement => {
  return create_element('div', attributes, children) as HTMLDivElement;
};

// Add other element creation functions (button, section, etc.) as needed

// Export any other functions that might be used in the tests
