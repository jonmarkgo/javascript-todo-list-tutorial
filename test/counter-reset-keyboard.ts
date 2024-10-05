"use strict";
// this file is borrowed from:
// https://github.com/dwyl/learn-elm-architecture-in-javascript/blob/master/examples/counter-reset-keyboard/counter.js
// it is included here purely for testing the "elmish" functions.
Object.defineProperty(exports, "__esModule", { value: true });
var elmish_1 = require("../lib/elmish");

interface Action {
    type: 'INC' | 'DEC' | 'RESET';
}

function updateCounterResetKeyboard(action: Action, model: number): number {
    switch (action.type) { // and an action (Action) runs a switch
        case 'INC': return model + 1; // add 1 to the model
        case 'DEC': return model - 1; // subtract 1 from model
        case 'RESET': return 0; // reset state to 0 (Zero) git.io/v9KJk
        default: return model; // if no action, return curent state.
    } // (default action always returns current)
}

function viewCounterResetKeyboard(model: number, signal: (action: Action) => void): HTMLElement {
    var createTextElement = function (text: string): HTMLSpanElement {
        var span = document.createElement('span');
        span.textContent = text;
        return span;
    };
    return (0, elmish_1.createDiv)([], [
        (0, elmish_1.createButton)(["class=inc", "id=inc"], [createTextElement('+')]),
        (0, elmish_1.createDiv)(["class=count", "id=count"], [createTextElement(model.toString())]),
        (0, elmish_1.createButton)(["class=dec", "id=dec"], [createTextElement('-')]),
        (0, elmish_1.createButton)(["class=reset", "id=reset"], [createTextElement('Reset')])
    ]);
}

function subscriptions(signal: (action: Action) => void): void {
    var UP_KEY = 38; // increment the counter when [↑] (up) key is pressed
    var DOWN_KEY = 40; // decrement the counter when [↓] (down) key is pressed
    document.addEventListener('keyup', function handler(e: KeyboardEvent) {
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
        view: viewCounterResetKeyboard,
        update: updateCounterResetKeyboard,
    };
}
