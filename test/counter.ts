// this file is borrowed from:
// https://github.com/dwyl/learn-elm-architecture-in-javascript/blob/master/examples/counter-reset/counter.js
// it is included here purely for testing the "elmish" functions.

// Define the Component's Actions:
type Action = 'inc' | 'dec' | 'reset';
type Model = number;
type Signal = (action: Action) => () => void;

// Update function takes the current state and an action and returns a new state
function update(action: Action, model: Model): Model {
  switch (action) {
    case 'inc': return model + 1;
    case 'dec': return model - 1;
    case 'reset': return 0;
    default: return model;
  }
}

// View function renders the model as HTML
function view(model: Model, signal: Signal): HTMLElement {
  return container([
    button('-', signal, 'dec'),
    div('count', model.toString()),
    button('+', signal, 'inc'),
    button('Reset', signal, 'reset')
  ]);
}

// Mount Function receives all MUV and mounts the app in the "root" DOM Element
function mount(model: Model, update: (action: Action, model: Model) => Model, view: (model: Model, signal: Signal) => HTMLElement, root_element_id: string): void {
  const root = document.getElementById(root_element_id); // root DOM element
  if (!root) {
    console.error(`Element with id ${root_element_id} not found`);
    return;
  }
  function signal(action: Action): () => void {
    return function callback(): void {
      model = update(action, model);
      if (root) {
        empty(root);
        root.appendChild(view(model, signal));
      }
    };
  }
  root.appendChild(view(model, signal));
}

// "Helper" functions to create DOM elements
function empty(node: HTMLElement): void {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function button(text: string, signal: Signal, action: Action): HTMLButtonElement {
  const button = document.createElement('button');
  const textNode = document.createTextNode(text);
  button.appendChild(textNode);
  button.onclick = signal(action);
  return button;
}

function div(divid: string, text?: string): HTMLDivElement {
  const div = document.createElement('div');
  div.id = divid;
  div.className = divid;
  if (text) {
    const textNode = document.createTextNode(text);
    div.appendChild(textNode);
  }
  return div;
}

function container(childnodes: HTMLElement[]): HTMLDivElement {
  const container = document.createElement('div');
  container.className = 'counter';
  childnodes.forEach(function (el) {
    container.appendChild(el);
  });
  return container;
}

/* The code block below ONLY Applies to tests run using Node.js */
/* istanbul ignore else */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    update: update,
    view: view,
    mount: mount
  };
}
