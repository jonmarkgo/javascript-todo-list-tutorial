"use strict";
// this file is borrowed from:
// https://github.com/dwyl/learn-elm-architecture-in-javascript/blob/master/examples/counter-reset-keyboard/counter.js
// it is included here purely for testing the "elmish" functions.
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = update;
exports.view = view;
exports.subscriptions = subscriptions;
import { div, button, text } from "../lib/elmish";
export function update(action: string, model: number): number {
    switch (action) { // and an action (String) runs a switch
        case 'inc': return model + 1; // add 1 to the model
        case 'dec': return model - 1; // subtract 1 from model
        case 'reset': return 0; // reset state to 0 (Zero) git.io/v9KJk
        default: return model; // if no action, return curent state.
    } // (default action always returns current)
}
export function view(model: number, signal: (action: string) => () => void): HTMLElement {
    return div([], [
        button(["class=inc", "id=inc", "onclick=" + signal('inc').toString()], [text('+')]), // increment
        div(["class=count", "id=count"], [div([], [text(model.toString())])]), // count
        button(["class=dec", "id=dec", "onclick=" + signal('dec').toString()], [text('-')]), // decrement
        button(["class=reset", "id=reset", "onclick=" + signal('reset').toString()], [text('Reset')])
    ]);
}
export function subscriptions(signal: (action: string) => () => void): void {
    var UP_KEY = 38; // increment the counter when [↑] (up) key is pressed
    var DOWN_KEY = 40; // decrement the counter when [↓] (down) key is pressed
    document.addEventListener('keyup', function handler(e: KeyboardEvent) {
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
