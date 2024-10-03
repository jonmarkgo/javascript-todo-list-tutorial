// this file is borrowed from:
// https://github.com/dwyl/learn-elm-architecture-in-javascript/blob/master/examples/counter-reset-keyboard/counter.js
// it is included here purely for testing the "elmish" functions.

/* if require is available, it means we are in Node.js Land i.e. testing!
 in the broweser, the "elmish" DOM functions are loaded in a <script> tag */
/* istanbul ignore next */
if (typeof require !== 'undefined' && typeof window === 'undefined') {
  var { button, div, empty, mount, text } = require('../lib/elmish.js');
}

import { Model, Action, Signal, update, view } from './counter';

function subscriptions (signal: Signal): void {
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
    subscriptions: subscriptions,
    view: view,
    update: update,
  }
}
