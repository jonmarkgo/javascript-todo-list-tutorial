// this file is borrowed from:
// https://github.com/dwyl/learn-elm-architecture-in-javascript/blob/master/examples/counter-reset-keyboard/counter.js
// it is included here purely for testing the "elmish" functions.

import * as elmish from '../lib/elmish';

/* if require is available, it means we are in Node.js Land i.e. testing!
 in the broweser, the "elmish" DOM functions are loaded in a <script> tag */
/* istanbul ignore next */

type ResetCounterModel = number;
type ResetCounterAction = 'inc' | 'dec' | 'reset';

function update (action: ResetCounterAction, model: ResetCounterModel): ResetCounterModel {    // Update function takes the current state
  switch(action) {                   // and an action (String) runs a switch
    case 'inc': return model + 1;    // add 1 to the model
    case 'dec': return model - 1;    // subtract 1 from model
    case 'reset': return 0;          // reset state to 0 (Zero) git.io/v9KJk
    default: return model;           // if no action, return curent state.
  }                                  // (default action always returns current)
}

type ResetCounterSignal = (action: ResetCounterAction) => (event: Event) => void;

function view (model: ResetCounterModel, signal: ResetCounterSignal): HTMLElement {
  return elmish.div(['counter'], [
    elmish.button(['+', (e: Event) => signal('inc')(e)], []), // increment
    elmish.div(['count'], [(() => { const span = document.createElement('span'); span.appendChild(document.createTextNode(model.toString())); return span; })()]), // count
    elmish.button(['-', (e: Event) => signal('dec')(e)], []), // decrement
    elmish.button(['Reset', (e: Event) => signal('reset')(e)], [])
  ]);
}

function subscriptions (signal: ResetCounterSignal): void {
  const UP_KEY = 38; // increment the counter when [↑] (up) key is pressed
  const DOWN_KEY = 40; // decrement the counter when [↓] (down) key is pressed

  document.addEventListener('keyup', function handler (e: KeyboardEvent) {
    switch (e.keyCode) {
      case UP_KEY:
        signal('inc')(new Event('keyup')); // invoke the signal with a mock event
        break;
      case DOWN_KEY:
        signal('dec')(new Event('keyup')); // invoke the signal with a mock event
        break;
    }
  });
}

/* The code block below ONLY Applies to tests run using Node.js */
/* istanbul ignore else */
export {
  subscriptions,
  view,
  update,
};
