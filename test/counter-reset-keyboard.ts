// this file is borrowed from:
// https://github.com/dwyl/learn-elm-architecture-in-javascript/blob/master/examples/counter-reset-keyboard/counter.js
// it is included here purely for testing the "elmish" functions.

/* if require is available, it means we are in Node.js Land i.e. testing!
 in the broweser, the "elmish" DOM functions are loaded in a <script> tag */
/* istanbul ignore next */
if (typeof require !== 'undefined' && this.window !== this) {
  var elmish = require('../lib/elmish.js');
}

type CounterModel = number;
type CounterAction = 'inc' | 'dec' | 'reset';

function counterUpdate (action: CounterAction, model: CounterModel): CounterModel {    // Update function takes the current state
  switch(action) {                   // and an action (String) runs a switch
    case 'inc': return model + 1;    // add 1 to the model
    case 'dec': return model - 1;    // subtract 1 from model
    case 'reset': return 0;          // reset state to 0 (Zero) git.io/v9KJk
    default: return model;           // if no action, return curent state.
  }                                  // (default action always returns current)
}

type CounterSignal = (action: CounterAction) => () => void;

function counterView (model: CounterModel, signal: CounterSignal): HTMLElement {
  return elmish.div([], [
    elmish.button(["class=inc", "id=inc", signal('inc')], [elmish.text('+')]), // increment
    elmish.div(["class=count", "id=count"], [elmish.text(model.toString())]), // count
    elmish.button(["class=dec", "id=dec", signal('dec')], [elmish.text('-')]), // decrement
    elmish.button(["class=reset", "id=reset", signal('reset')], [elmish.text('Reset')])
  ]);
}

function counterSubscriptions (signal: CounterSignal): void {
  const UP_KEY = 38; // increment the counter when [↑] (up) key is pressed
  const DOWN_KEY = 40; // decrement the counter when [↓] (down) key is pressed

  document.addEventListener('keyup', function handler (e: KeyboardEvent) {
    switch (e.keyCode) {
      case UP_KEY:
        signal('inc')(); // invoke the signal > callback function directly
        break;
      case DOWN_KEY:
        signal('dec')();
        break;
    }
  });
}

/* The code block below ONLY Applies to tests run using Node.js */
/* istanbul ignore else */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    subscriptions: counterSubscriptions,
    view: counterView,
    update: counterUpdate,
  }
}
