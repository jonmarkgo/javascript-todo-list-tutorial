// this file is borrowed from:
// https://github.com/dwyl/learn-elm-architecture-in-javascript/blob/master/examples/counter-reset-keyboard/counter.js
// it is included here purely for testing the "elmish" functions.

import { button, div, empty, mount, text } from '../lib/elmish.js';

type Model = number;
type Action = 'inc' | 'dec' | 'reset';

function update (action: Action, model: Model): Model {    // Update function takes the current state
  switch(action) {                   // and an action (String) runs a switch
    case 'inc': return model + 1;    // add 1 to the model
    case 'dec': return model - 1;    // subtract 1 from model
    case 'reset': return 0;          // reset state to 0 (Zero) git.io/v9KJk
    default: return model;           // if no action, return curent state.
  }                                  // (default action always returns current)
}

type Signal = (action: Action) => (ev: MouseEvent | KeyboardEvent) => void;

function view (model: Model, signal: Signal): HTMLElement {
  return div([], [
    button(["class=inc", "id=inc", signal('inc') as unknown as string], [text('+')]),
    div(["class=count", "id=count"], [text(model.toString())]),
    button(["class=dec", "id=dec", signal('dec') as unknown as string], [text('-')]),
    button(["class=reset", "id=reset", signal('reset') as unknown as string], [text('Reset')])
  ]);
}

function subscriptions (signal: Signal): void {
  const UP_KEY = 38; // increment the counter when [↑] (up) key is pressed
  const DOWN_KEY = 40; // decrement the counter when [↓] (down) key is pressed

  document.addEventListener('keyup', function handler (e: KeyboardEvent) {
    switch (e.keyCode) {
      case UP_KEY:
        signal('inc')(e);
        break;
      case DOWN_KEY:
        signal('dec')(e);
        break;
    }
  });
}

export {
  subscriptions,
  view,
  update,
};
