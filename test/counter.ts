// this file is borrowed from:
// https://github.com/dwyl/learn-elm-architecture-in-javascript/blob/master/examples/counter-reset/counter.js
// it is included here purely for testing the "elmish" functions.

import { mount as elmishMount, empty as elmishEmpty } from '../lib/elmish';

// Define the Component's Actions:
const Inc = 'inc';                     // increment the counter
const Dec = 'dec';                     // decrement the counter
const Res = 'reset';                   // reset counter: git.io/v9KJk

function update(action: string, model: number): number {
  switch(action) {                   // and an action (String) runs a switch
    case Inc: return model + 1;      // add 1 to the model
    case Dec: return model - 1;      // subtract 1 from model
    case Res: return 0;              // reset state to 0 (Zero) git.io/v9KJk
    default: return model;           // if no action, return curent state.
  }                                  // (default action always returns current)
}

function view(model: number, signal: (action: string) => () => void): HTMLElement {
  return container([                           // Store DOM nodes in an array
    button('+', signal, Inc),                  // then iterate to append them
    div('count', model.toString()),            // create div with stat as text
    button('-', signal, Dec),                  // decrement counter
    button('Reset', signal, Res)               // reset counter
  ]); // forEach is ES5 so IE9+
} // yes, for loop is "faster" than forEach, but readability trumps "perf" here!

// Mount Function receives all MUV and mounts the app in the "root" DOM Element
function mount(
  model: number,
  update: (action: string, model: number) => number,
  view: (model: number, signal: (action: string) => () => void) => HTMLElement,
  root_element_id: string
): void {
  const root = document.getElementById(root_element_id); // root DOM element
  if (!root) throw new Error(`Element with id "${root_element_id}" not found`);

  function signal(action: string): () => void {
    return function callback(): void {
      model = update(action, model); // update model according to action
      if (root) {
        elmishEmpty(root);
        root.appendChild(view(model, signal)); // subsequent re-rendering
      }
    };
  }

  root.appendChild(view(model, signal));    // render initial model (once)
}

// The following are "Helper" Functions which each "Do ONLY One Thing" and are
// used in the "View" function to render the Model (State) to the Browser DOM:

// empty the contents of a given DOM element "node" (before re-rendering)
function empty(node: HTMLElement): void {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
} // Inspired by: stackoverflow.com/a/3955238/1148249

function button(text: string, signal: (action: string) => () => void, action: string): HTMLButtonElement {
  const buttonElement = document.createElement('button');
  const textNode = document.createTextNode(text);    // human-readable button text
  buttonElement.appendChild(textNode);               // text goes *inside* not attrib
  buttonElement.className = action;                  // use action as CSS class
  buttonElement.id = action;
  // console.log(signal, ' action:', action)
  buttonElement.onclick = signal(action);            // onclick tells how to process
  return buttonElement;                              // return the DOM node(s)
} // how to create a button in JavaScript: stackoverflow.com/a/8650996/1148249

function div(divid: string, text?: string): HTMLDivElement {
  const divElement = document.createElement('div');
  divElement.id = divid;
  divElement.className = divid;
  if (text !== undefined) { // if text is passed in render it in a "Text Node"
    const txt = document.createTextNode(text);
    divElement.appendChild(txt);
  }
  return divElement;
}

// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/section
function container(elements: HTMLElement[]): HTMLElement {
  const con = document.createElement('section');
  con.className = 'counter';
  elements.forEach((el: HTMLElement) => { con.appendChild(el) });
  return con;
}

/* The code block below ONLY Applies to tests run using Node.js */
/* istanbul ignore else */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    view: view,
    mount: mount,
    update: update,
    div: div,
    button: button,
    empty: empty,
  }
}
