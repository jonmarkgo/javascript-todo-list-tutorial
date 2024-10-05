"use strict";
import { empty, mountElmish } from '../lib/elmish';
// this file is borrowed from:
// https://github.com/dwyl/learn-elm-architecture-in-javascript/blob/master/examples/counter-reset/counter.js
// it is included here purely for testing the "elmish" functions.
// Define the Component's Actions:
var Inc = 'inc'; // increment the counter
var Dec = 'dec'; // decrement the counter
var Res = 'reset'; // reset counter: git.io/v9KJk
function updateCounterBasic(action: string, model: number): number {
    switch (action) { // and an action (String) runs a switch
        case Inc: return model + 1; // add 1 to the model
        case Dec: return model - 1; // subtract 1 from model
        case Res: return 0; // reset state to 0 (Zero) git.io/v9KJk
        default: return model; // if no action, return curent state.
    } // (default action always returns current)
}
function viewCounterBasic(model: number): HTMLElement {
    const signal = (action: string) => () => {
        console.log('Action:', action);
    };
    return container([
        button('+', signal, Inc), // then iterate to append them
        div('count', model.toString()), // create div with stat as text
        button('-', signal, Dec), // decrement counter
        button('Reset', signal, Res) // reset counter
    ]); // forEach is ES5 so IE9+
} // yes, for loop is "faster" than forEach, but readability trumps "perf" here!
// Mount Function receives all MUV and mounts the app in the "root" DOM Element
function mountCounter(model: number, update: (action: string, model: number) => number, view: (model: number) => HTMLElement, root_element_id: string) {
    var root = document.getElementById(root_element_id); // root DOM element
    if (!root)
        return;
    function signal(action: string) {
        return function callback() {
            model = update(action, model); // update model according to action
            empty(root!);
            root!.appendChild(view(model)); // subsequent re-rendering
        };
    }
    ;
    root.appendChild(view(model)); // render initial model (once)
}
// The following are "Helper" Functions which each "Do ONLY One Thing" and are
// used in the "View" function to render the Model (State) to the Browser DOM:
// Import the empty function from lib/elmish.ts

function button(text: string, signal: (action: string) => () => void, action: string): HTMLElement {
    var button = document.createElement('button');
    var textNode = document.createTextNode(text); // human-readable button text
    button.appendChild(textNode); // text goes *inside* not attrib
    button.className = action; // use action as CSS class
    button.id = action;
    // console.log(signal, ' action:', action)
    button.onclick = signal(action); // onclick tells how to process
    return button; // return the DOM node(s)
} // how to create a button in JavaScript: stackoverflow.com/a/8650996/1148249
function div(divid: string, text?: string): HTMLElement {
    var div = document.createElement('div');
    div.id = divid;
    div.className = divid;
    if (text !== undefined) { // if text is passed in render it in a "Text Node"
        var txt = document.createTextNode(text);
        div.appendChild(txt);
    }
    return div;
}
// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/section
function container(elements: HTMLElement[]): HTMLElement {
    var con = document.createElement('section');
    con.className = 'counter';
    elements.forEach(function (el) { con.appendChild(el); });
    return con;
}
/* The code block below ONLY Applies to tests run using Node.js */
/* istanbul ignore else */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        view: viewCounterBasic,
        mount: mountCounter,
        update: updateCounterBasic,
        div: div,
        button: button,
        updateCounterBasic: updateCounterBasic,
        viewCounterBasic: viewCounterBasic,
    };
}

export { updateCounterBasic, viewCounterBasic };
