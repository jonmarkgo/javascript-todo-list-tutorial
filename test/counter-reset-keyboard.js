// this file is borrowed from:
// https://github.com/dwyl/learn-elm-architecture-in-javascript/blob/master/examples/counter-reset-keyboard/counter.js
// it is included here purely for testing the "elmish" functions.
/* if require is available, it means we are in Node.js Land i.e. testing!
 in the broweser, the "elmish" DOM functions are loaded in a <script> tag */
/* istanbul ignore next */
if (typeof require !== 'undefined' && typeof window === 'undefined') {
    var _a = require('../lib/elmish.js'), button = _a.button, div = _a.div, empty = _a.empty, mount = _a.mount, text = _a.text;
}
import { update, view } from './counter';
function subscriptions(signal) {
    var UP_KEY = 38; // increment the counter when [↑] (up) key is pressed
    var DOWN_KEY = 40; // decrement the counter when [↓] (down) key is pressed
    document.addEventListener('keyup', function handler(e) {
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
    };
}
