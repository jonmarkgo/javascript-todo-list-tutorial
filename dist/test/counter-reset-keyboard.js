// this file is borrowed from:
// https://github.com/dwyl/learn-elm-architecture-in-javascript/blob/master/examples/counter-reset-keyboard/counter.js
// it is included here purely for testing the "elmish" functions.
import { button, div, text } from '../lib/elmish.js';
// Helper function to wrap text() and return HTMLElement
function textElement(content) {
    const span = document.createElement('span');
    span.appendChild(text(content));
    return span;
}
function update(action, model) {
    switch (action) { // and an action (String) runs a switch
        case 'inc': return model + 1; // add 1 to the model
        case 'dec': return model - 1; // subtract 1 from model
        case 'reset': return 0; // reset state to 0 (Zero) git.io/v9KJk
        default: return model; // if no action, return curent state.
    } // (default action always returns current)
}
function view(model, signal) {
    return div([], [
        button(["class=inc", "id=inc", signal('inc')], [textElement('+')]),
        div(["class=count", "id=count"], [textElement(model.toString())]),
        button(["class=dec", "id=dec", signal('dec')], [textElement('-')]),
        button(["class=reset", "id=reset", signal('reset')], [textElement('Reset')])
    ]);
}
function subscriptions(signal) {
    const UP_KEY = 38; // increment the counter when [↑] (up) key is pressed
    const DOWN_KEY = 40; // decrement the counter when [↓] (down) key is pressed
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
export { subscriptions, view, update, };
//# sourceMappingURL=counter-reset-keyboard.js.map