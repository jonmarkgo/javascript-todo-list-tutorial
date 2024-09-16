// this file is borrowed from:
// https://github.com/dwyl/learn-elm-architecture-in-javascript/blob/master/examples/counter-reset/counter.js
// it is included here purely for testing the "elmish" functions.

// Define the Component's Actions:
type Action = 'inc' | 'dec' | 'reset';

const Inc: Action = 'inc';  // increment the counter
const Dec: Action = 'dec';  // decrement the counter
const Res: Action = 'reset';  // reset counter: git.io/v9KJk

interface Model {
  count: number;
}

function update(action: Action, model: Model): Model {
  switch (action) {
    case Inc: return { count: model.count + 1 };
    case Dec: return { count: model.count - 1 };
    case Res: return { count: 0 };
    default: return model;
  }
}

function view(model: Model, signal: (action: Action) => () => void): HTMLElement {
  return container([
    button('+', signal, Inc),
    div('count', model.count.toString()),
    button('-', signal, Dec),
    button('Reset', signal, Res)
  ]);
}

function mount(initialModel: Model, update: (action: Action, model: Model) => Model, view: (model: Model, signal: (action: Action) => () => void) => HTMLElement, rootElementId: string): void {
  const root = document.getElementById(rootElementId);
  if (!root) throw new Error(`Element with id "${rootElementId}" not found`);

  let model = initialModel;

  function signal(action: Action) {
    return function callback() {
      model = update(action, model);
      empty(root!);
      root!.appendChild(view(model, signal));
    };
  }

  root.appendChild(view(model, signal));
}

// Helper Functions

function empty(node: HTMLElement): void {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function button(text: string, signal: (action: Action) => () => void, action: Action): HTMLButtonElement {
  const button = document.createElement('button');
  const textNode = document.createTextNode(text);
  button.appendChild(textNode);
  button.className = action;
  button.id = action;
  button.onclick = signal(action);
  return button;
}

function div(divId: string, text: string): HTMLDivElement {
  const div = document.createElement('div');
  div.id = divId;
  div.className = divId;
  if (text !== undefined) {
    const txt = document.createTextNode(text);
    div.appendChild(txt);
  }
  return div;
}

function container(elements: HTMLElement[]): HTMLElement {
  const con = document.createElement('section');
  con.className = 'counter';
  elements.forEach((el) => con.appendChild(el));
  return con;
}

export {
  Action,
  Model,
  view,
  mount,
  update,
  div,
  button,
  empty
};
