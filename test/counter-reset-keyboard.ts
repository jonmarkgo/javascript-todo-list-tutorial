// this file is borrowed from:
// https://github.com/dwyl/learn-elm-architecture-in-javascript/blob/master/examples/counter-reset-keyboard/counter.js
// it is included here purely for testing the "elmish" functions.

import { createButton, createDiv, createText } from '../lib/elmish';

// Model and Action types should be imported from a shared types file
import { Action } from '../lib/types';

function update (action: Action, model: number): number {    // Update function takes the current state
  switch(action.type) {              // and an action (Action) runs a switch
    case 'ADD': return model + 1;    // add 1 to the model
    case 'TOGGLE': return model - 1; // subtract 1 from model
    case 'CLEAR_COMPLETED': return 0;// reset state to 0 (Zero) git.io/v9KJk
    default: return model;           // if no action, return curent state.
  }                                  // (default action always returns current)
}

type Signal = (action: Action) => void;

function view (model: number, signal: Signal): HTMLElement {
  const createTextElement = (text: string): HTMLElement => {
    const span = document.createElement('span');
    span.textContent = text;
    return span;
  };

  return createDiv([], [
    createButton(["class=inc", "id=inc"], [createTextElement('+')]),
    createDiv(["class=count", "id=count"], [createTextElement(model.toString())]),
    createButton(["class=dec", "id=dec"], [createTextElement('-')]),
    createButton(["class=reset", "id=reset"], [createTextElement('Reset')])
  ]);
}

function subscriptions (signal: Signal): void {
  const UP_KEY = 38; // increment the counter when [↑] (up) key is pressed
  const DOWN_KEY = 40; // decrement the counter when [↓] (down) key is pressed

  document.addEventListener('keyup', function handler (e: KeyboardEvent) {
    switch (e.keyCode) {
      case UP_KEY:
        signal({ type: 'INC' });
        break;
      case DOWN_KEY:
        signal({ type: 'DEC' });
        break;
    }
  });
}

/* The code block below ONLY Applies to tests run using Node.js */
/* istanbul ignore else */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    subscriptions: subscriptions,
    view: view,
    update: update,
  }
}
