"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
import test from 'tape'; // https://github.com/dwyl/learn-tape
import fs from 'fs'; // read html files (see below)
import path from 'path'; // so we can open files cross-platform
import { empty, mountElmish as mount, add_attributes } from "../lib/elmish";
import { Test } from 'tape';
import { updateCounterBasic as update, viewCounterBasic as view } from './counter';

var html = fs.readFileSync(path.resolve(__dirname, '../index.html'));
require('jsdom-global')(html); // https://github.com/rstacruz/jsdom-global
import jsdom from 'jsdom';
var JSDOM = jsdom.JSDOM;
var id = 'test-app'; // all tests use separate root element
test('elmish.empty("root") removes DOM elements from container', function (t: Test) {
    var _a;
    // setup the test div:
    var text = 'Hello World!';
    var divid = "mydiv";
    var root = document.getElementById(id);
    var div = document.createElement('div');
    div.id = divid;
    var txt = document.createTextNode(text);
    div.appendChild(txt);
    root?.appendChild(div);
    // check text of the div:
    var actual = (_a = document.getElementById(divid)) === null || _a === void 0 ? void 0 : _a.textContent;
    t.equal(actual, text, "Contents of mydiv is: " + actual + ' == ' + text);
    t.equal(root?.childElementCount, 1, "Root element " + id + " has 1 child el");
    // empty the root DOM node:
    if (root) empty(root); // exercise the `empty` function!
    t.equal(root?.childElementCount, 0, "After empty(root) has 0 child elements!");
    t.end();
});
test('elmish.mount app expect state to be Zero', function (t: Test) {
    var _a, _b, _c;
    // use view and update from counter-reset example
    // to confirm that our elmish.mount function is generic!
    var root = document.getElementById(id);
    mount(7, update, view, id, function () { }); // Added empty function as subscriptions argument
    var actual = (_a = document.getElementById(id)) === null || _a === void 0 ? void 0 : _a.textContent;
    var actual_stripped = parseInt((_b = actual === null || actual === void 0 ? void 0 : actual.replace('+', '').replace('-Reset', '')) !== null && _b !== void 0 ? _b : '', 10);
    var expected = 7;
    t.equal(expected, actual_stripped, "Inital state set to 7.");
    // reset to zero:
    console.log('root', root);
    var btn = root?.getElementsByClassName("reset")[0] as HTMLElement; // click reset button
    btn.click(); // Click the Reset button!
    var state = parseInt((_c = root?.getElementsByClassName('count')[0]
        .textContent) !== null && _c !== void 0 ? _c : '', 10);
    t.equal(state, 0, "State is 0 (Zero) after reset."); // state reset to 0!
    if (root) empty(root); // clean up after tests
    t.end();
});
test('elmish.add_attributes adds "autofocus" attribute', function (t: Test) {
    var _a;
    var document = (new JSDOM("<!DOCTYPE html><div id=\"".concat(id, "\"></div>"))).window.document;
    (_a = document.getElementById(id)) === null || _a === void 0 ? void 0 : _a.appendChild(add_attributes(["class=new-todo", "autofocus", "id=new"], document.createElement('input')));
    // document.activeElement via: https://stackoverflow.com/a/17614883/1148249
    // t.deepEqual(document.getElementById('new'), document.activeElement,
    //   '<input autofocus> is in "focus"');
    // This assertion is commented because of a broking change in JSDOM see:
    // https://github.com/dwyl/javascript-todo-list-tutorial/issues/29
    t.end();
});
test('elmish.add_attributes applies HTML class attribute to el', function (t: Test) {
    const root = document.getElementById(id);
    if (!root) {
        t.fail('Root element not found');
        return t.end();
    }
    let div = document.createElement('div');
    div.id = 'divid';
    div = (0, elmish_1.add_attributes)(["class=apptastic"], div);
    root.appendChild(div);
    // test the div has the desired class:
    const nodes = document.getElementsByClassName('apptastic');
    t.equal(nodes.length, 1, "<div> has 'apptastic' CSS class applied");
    t.end();
});
test('elmish.add_attributes applies id HTML attribute to a node', function (t: Test) {
    var _a;
    var root = document.getElementById(id);
    var el = document.createElement('section');
    el = (0, elmish_1.add_attributes)(["id=myid"], el);
    var text = 'hello world!';
    var txt = document.createTextNode(text);
    el.appendChild(txt);
    if (root) {
        root.appendChild(el);
        var actual = (_a = document.getElementById('myid')) === null || _a === void 0 ? void 0 : _a.textContent;
        t.equal(actual, text, "<section> has 'myid' id attribute");
        (0, elmish_1.empty)(root); // clear the "DOM"/"state" before next test
    } else {
        t.fail('Root element not found');
    }
    t.end();
});
test('elmish.add_attributes applies multiple attribute to node', function (t: Test) {
    var _a;
    var root = document.getElementById(id);
    (0, elmish_1.empty)(root);
    var el = document.createElement('span');
    el = (0, elmish_1.add_attributes)(["id=myid", "class=totes mcawesome"], el);
    var text = 'hello world';
    var txt = document.createTextNode(text);
    el.appendChild(txt);
    if (root) {
        root.appendChild(el);
        var actual = (_a = document.getElementById('myid')) === null || _a === void 0 ? void 0 : _a.textContent;
        t.equal(actual, text, "<section> has 'myid' id attribute");
        t.equal(el.className, 'totes mcawesome', "CSS class applied: ");
    } else {
        t.fail('Root element not found');
    }
    t.end();
});
test('elmish.add_attributes set placeholder on <input> element', function (t: Test) {
    var _a;
    var root = document.getElementById(id);
    var input = document.createElement('input');
    input.id = 'new-todo';
    input = (0, elmish_1.add_attributes)(["placeholder=What needs to be done?"], input);
    if (root) {
        root.appendChild(input);
    } else {
        t.fail('Root element not found');
    }
    var placeholder = (_a = document.getElementById('new-todo')) === null || _a === void 0 ? void 0 : _a.getAttribute("placeholder");
    t.equal(placeholder, "What needs to be done?", "paceholder set on <input>");
    t.end();
});
test('elmish.add_attributes set data-id on <li> element', function (t: Test) {
    var _a;
    var root = document.getElementById(id);
    var li = document.createElement('li');
    li.id = 'task1';
    li = (0, elmish_1.add_attributes)(["data-id=123"], li);
    if (root) {
        root.appendChild(li);
        var data_id = (_a = document.getElementById('task1')) === null || _a === void 0 ? void 0 : _a.getAttribute("data-id");
        t.equal(data_id, '123', "data-id successfully added to <li> element");
    } else {
        t.fail('Root element not found');
    }
    t.end();
});
test('elmish.add_attributes set "for" attribute <label> element', function (t: Test) {
    var _a;
    var root = document.getElementById(id);
    var li = document.createElement('label');
    li.id = 'toggle';
    li = (0, elmish_1.add_attributes)(["for=toggle-all"], li);
    if (root) {
        root.appendChild(li);
        var label_for = (_a = document.getElementById('toggle')) === null || _a === void 0 ? void 0 : _a.getAttribute("for");
        t.equal(label_for, "toggle-all", '<label for="toggle-all">');
    } else {
        t.fail('Root element not found');
    }
    t.end();
});
test('elmish.add_attributes type="checkbox" on <input> element', function (t: Test) {
    var _a;
    var root = document.getElementById(id);
    var input = document.createElement('input');
    input = (0, elmish_1.add_attributes)(["type=checkbox", "id=toggle-all"], input);
    if (root) {
        root.appendChild(input);
        var type_atrr = (_a = document.getElementById('toggle-all')) === null || _a === void 0 ? void 0 : _a.getAttribute("type");
        t.equal(type_atrr, "checkbox", '<input id="toggle-all" type="checkbox">');
    } else {
        t.fail('Root element not found');
    }
    t.end();
});
test('elmish.add_attributes apply style="display: block;"', function (t: Test) {
    var root = document.getElementById(id);
    (0, elmish_1.empty)(root);
    var sec = document.createElement('section');
    if (root) {
        root.appendChild((0, elmish_1.add_attributes)(["id=main", "style=display: block;"], sec));
        var style = window.getComputedStyle(document.getElementById('main')!);
        t.equal(style.display, 'block', 'style="display: block;" applied!');
    } else {
        t.fail('Root element not found');
    }
    t.end();
});
test('elmish.add_attributes checked=true on "done" item', function (t: Test) {
    var root = document.getElementById(id);
    (0, elmish_1.empty)(root);
    var input = document.createElement('input');
    input = (0, elmish_1.add_attributes)(["type=checkbox", "id=item1", "checked=true"], input);
    if (root) {
        root.appendChild(input);
        var checked = (document.getElementById('item1') as HTMLInputElement).checked;
        t.equal(checked, true, '<input type="checkbox" checked="checked">');
        // test "checked=false" so we know we are able to "toggle" a todo item:
        root.appendChild((0, elmish_1.add_attributes)(["type=checkbox", "id=item2"], document.createElement('input')));
        t.equal((document.getElementById('item2') as HTMLInputElement).checked, false, 'checked=false');
    } else {
        t.fail('Root element not found');
    }
    t.end();
});
test('elmish.add_attributes <a href="#/active">Active</a>', function (t: Test) {
    var root = document.getElementById(id);
    (0, elmish_1.empty)(root);
    if (root) {
        root.appendChild((0, elmish_1.add_attributes)(["href=#/active", "class=selected", "id=active"], document.createElement('a')));
        // note: "about:blank" is the JSDOM default "window.location.href"
        console.log('JSDOM window.location.href:', window.location.href);
        // so when an href is set *relative* to this it becomes "about:blank#/my-link"
        // so we *remove* it before the assertion below, but it works fine in browser!
        var href = (document.getElementById('active') as HTMLAnchorElement).href.replace('about:blank', '');
        t.equal(href, "#/active", 'href="#/active" applied to "active" link');
    } else {
        t.fail('Root element not found');
    }
    t.end();
});
/** DEFAULT BRANCH **/
test('test default branch of elmish.add_attributes (no effect)', function (t: Test) {
    var root = document.getElementById(id);
    var div = document.createElement('div');
    div.id = 'divid';
    // "Clone" the div DOM node before invoking elmish.attributes to compare
    var clone = div.cloneNode(true);
    div = (0, elmish_1.add_attributes)(["unrecognised_attribute=noise"], div);
    t.deepEqual(div, clone, "<div> has not been altered");
    t.end();
});
/** null attrlist **/
test('test elmish.add_attributes attrlist null (no effect)', function (t: Test) {
    var root = document.getElementById(id);
    var div = document.createElement('div');
    div.id = 'divid';
    // "Clone" the div DOM node before invoking elmish.attributes to compare
    var clone = div.cloneNode(true);
    div = (0, elmish_1.add_attributes)([], div); // should not "explode"
    t.deepEqual(div, clone, "<div> has not been altered");
    t.end();
});
test('elmish.append_childnodes append child DOM nodes to parent', function (t: Test) {
    var root = document.getElementById(id);
    if (root) {
        (0, elmish_1.empty)(root); // clear the test DOM before!
        var div_1 = document.createElement('div');
        var p = document.createElement('p');
        var section_1 = document.createElement('section');
        (0, elmish_1.append_childnodes)([div_1, p, section_1], root);
        t.equal(root.childElementCount, 3, "Root element " + id + " has 3 child els");
    }
    t.end();
});
test('elmish.section creates a <section> HTML element', function (t: Test) {
    var p = document.createElement('p');
    p.id = 'para';
    var text = 'Hello World!';
    var txt = document.createTextNode(text);
    p.appendChild(txt);
    // create the `<section>` HTML element using our section function
    var sectionElement = (0, elmish_1.section)(["class=new-todo"], [p]);
    var rootElement = document.getElementById(id);
    if (rootElement) {
        rootElement.appendChild(sectionElement); // add section with <p>
        // document.activeElement via: https://stackoverflow.com/a/17614883/1148249
        var paraElement = document.getElementById('para');
        if (paraElement) {
            t.equal(paraElement.textContent, text, '<section> <p>' + text + '</p></section> works as expected!');
        }
        (0, elmish_1.empty)(rootElement);
    }
    t.end();
});
test('elmish create <header> view using HTML element functions', function (t: Test) {
    var rootElement = document.getElementById(id);
    if (rootElement) {
        (0, elmish_1.append_childnodes)([
            (0, elmish_1.section)(["class=todoapp"], [
                (0, elmish_1.header)(["class=header"], [
                    (0, elmish_1.h1)([], [
                        (0, elmish_1.createText)("todos")
                    ]), // </h1>
                    (0, elmish_1.input)([
                        "id=new",
                        "class=new-todo",
                        "placeholder=What needs to be done?",
                        "autofocus"
                    ], []) // <input> is "self-closing"
                ]) // </header>
            ])
        ], rootElement);
        var newElement = document.getElementById('new');
        if (newElement) {
            var place = newElement.getAttribute('placeholder');
            t.equal(place, "What needs to be done?", "placeholder set in <input> el");
        }
        var h1Element = document.querySelector('h1');
        if (h1Element) {
            t.equal(h1Element.textContent, 'todos', '<h1>todos</h1>');
        }
    }
    (0, elmish_1.empty)(document.getElementById(id));
    t.end();
});
test('elmish create "main" view using HTML DOM functions', function (t: Test) {
    var rootElement = document.getElementById(id);
    if (rootElement) {
        (0, elmish_1.append_childnodes)([
            (0, elmish_1.section)(["class=main", "style=display: block;"], [
                (0, elmish_1.input)(["id=toggle-all", "class=toggle-all", "type=checkbox"], []),
                (0, elmish_1.label)(["for=toggle-all"], [(0, elmish_1.createText)("Mark all as complete")]),
                (0, elmish_1.ul)(["class=todo-list"], [
                    (0, elmish_1.li)(["data-id=123", "class=completed"], [
                        (0, elmish_1.createDiv)(["class=view"], [
                            (0, elmish_1.input)(["class=toggle", "type=checkbox", "checked=true"], []),
                            (0, elmish_1.label)([], [(0, elmish_1.createText)('Learn The Elm Architecture ("TEA")')]),
                            (0, elmish_1.createButton)(["class=destroy"], [])
                        ]) // </div>
                    ]), // </li>
                    (0, elmish_1.li)(["data-id=234"], [
                        (0, elmish_1.createDiv)(["class=view"], [
                            (0, elmish_1.input)(["class=toggle", "type=checkbox"], []),
                            (0, elmish_1.label)([], [(0, elmish_1.createText)("Build TEA Todo List App")]),
                            (0, elmish_1.createButton)(["class=destroy"], [])
                        ]) // </div>
                    ]) // </li>
                ]) // </ul>
            ])
        ], rootElement);
        var completedElement = document.querySelector('.completed');
        if (completedElement) {
            var done = completedElement.textContent;
            t.equal(done, 'Learn The Elm Architecture ("TEA")', 'Done: Learn "TEA"');
        }
        var viewElements = document.querySelectorAll('.view');
        if (viewElements.length > 1) {
            var todo = viewElements[1].textContent;
            t.equal(todo, 'Build TEA Todo List App', 'Todo: Build TEA Todo List App');
        }
        (0, elmish_1.empty)(rootElement);
    }
    t.end();
});
test('elmish create <footer> view using HTML DOM functions', function (t: Test) {
    var rootElement = document.getElementById(id);
    if (rootElement) {
        (0, elmish_1.append_childnodes)([
            (0, elmish_1.footer)(["class=footer", "style=display: block;"], [
                (0, elmish_1.span)(["class=todo-count", "id=count"], [
                    (0, elmish_1.strong)("1"),
                    (0, elmish_1.createText)(" item left")
                ]),
                (0, elmish_1.ul)(["class=filters"], [
                    (0, elmish_1.li)([], [
                        (0, elmish_1.a)(["href=#/", "class=selected"], [(0, elmish_1.createText)("All")])
                    ]),
                    (0, elmish_1.li)([], [
                        (0, elmish_1.a)(["href=#/active"], [(0, elmish_1.createText)("Active")])
                    ]),
                    (0, elmish_1.li)([], [
                        (0, elmish_1.a)(["href=#/completed"], [(0, elmish_1.createText)("Completed")])
                    ])
                ]), // </ul>
                (0, elmish_1.button)(["class=clear-completed", "style=display:block"], [(0, elmish_1.createText)("Clear completed")])
            ])
        ], rootElement);
        // count of items left:
        var leftElement = document.getElementById('count');
        var left = leftElement ? leftElement.textContent : null;
        t.equal("1 item left", left, 'there is 1 (ONE) todo item left');
        var clear = document.querySelectorAll('button')[0].textContent;
        t.equal(clear, "Clear completed", '<button> text is "Clear completed"');
        var selected = document.querySelectorAll('.selected')[0].textContent;
        t.equal(selected, "All", "All is selected by default");
        (0, elmish_1.empty)(document.getElementById(id));
        t.end();
    }
});
// Remove duplicate test definition
test('elmish.route updates the url hash and sets history', function (t: Test) {
    var initial_hash = window.location.hash;
    console.log('START window.location.hash:', initial_hash, '(empty string)');
    var initial_history_length = window.history.length;
    console.log('START window.history.length:', initial_history_length);
    // update the URL Hash and Set Browser History
    var state = { hash: '' };
    var new_hash = '#/active';
    var new_state = (0, elmish_1.route)(state, 'Active', new_hash);
    console.log('UPDATED window.history.length:', window.history.length);
    console.log('UPDATED state:', new_state);
    console.log('UPDATED window.location.hash:', window.location.hash);
    t.notEqual(initial_hash, window.location.hash, "location.hash has changed!");
    t.equal(new_hash, new_state.hash, "state.hash is now: " + new_state.hash);
    t.equal(new_hash, window.location.hash, "window.location.hash: "
        + window.location.hash);
    t.equal(initial_history_length + 1, window.history.length, "window.history.length increased from: " + initial_history_length + ' to: '
        + window.history.length);
    t.end();
});
// Testing localStorage requires "polyfil" because:
// https://github.com/jsdom/jsdom/issues/1137 ¯\_(ツ)_/¯
// globals are bad! but a "necessary evil" here ...
var localStoragePolyfill: Storage = {
    getItem: function (key: string): string | null {
        var value = this[key as keyof typeof this];
        return typeof value === 'undefined' ? null : String(value);
    },
    setItem: function (key: string, value: string): void {
        this[key as keyof typeof this] = value;
    },
    removeItem: function (key: string): void {
        delete this[key as keyof typeof this];
    },
    length: 0,
    clear: function (): void { },
    key: function (index: number): string | null { return null; }
};
global.localStorage = global.localStorage || localStoragePolyfill;
localStorage.removeItem('todos-elmish_' + id);
// localStorage.setItem('hello', 'world!');
// console.log('localStorage (polyfil) hello', localStorage.getItem('hello'));
// // Test mount's localStorage using view and update from counter-reset example
// // to confirm that our elmish.mount localStorage works and is "generic".
test('elmish.mount sets model in localStorage', function (t: Test) {
    var _a;
    var _b = require('./counter.js'), view = _b.view, update = _b.update;
    var root = document.getElementById(id);
    (0, elmish_1.mount)(7, update, view, id, function () { }); // Added empty function as fifth argument
    // the "model" stored in localStorage should be 7 now:
    var storedValue = localStorage.getItem('todos-elmish_' + id);
    t.equal(storedValue !== null ? JSON.parse(storedValue) : null, 7, "todos-elmish_store is 7 (as expected). initial state saved to localStorage.");
    // test that mount still works as expected (check initial state of counter):
    var actual = (_a = document.getElementById(id)) === null || _a === void 0 ? void 0 : _a.textContent;
    var actual_stripped = actual ? parseInt(actual.replace('+', '')
        .replace('-Reset', ''), 10) : 0;
    var expected = 7;
    t.equal(expected, actual_stripped, "Inital state set to 7.");
    // attempting to "re-mount" with a different model value should not work
    // because mount should retrieve the value from localStorage
    (0, elmish_1.mount)(42, update, view, id, function () { }); // Added empty function as fifth argument
    var storedValue2 = localStorage.getItem('todos-elmish_' + id);
    t.equal(storedValue2 !== null ? JSON.parse(storedValue2) : null, 7, "todos-elmish_store is 7 (as expected). initial state saved to localStorage.");
    // increment the counter
    var btn = root === null || root === void 0 ? void 0 : root.getElementsByClassName("inc")[0]; // click increment button
    if (btn instanceof HTMLElement) {
        btn.click(); // Click the Increment button!
    }
    var state = 0;
    if (root) {
        const countElement = root.getElementsByClassName('count')[0];
        if (countElement && countElement.textContent) {
            state = parseInt(countElement.textContent, 10);
        }
    }
    t.equal(state, 8, "State is 8 after increment.");
    // the "model" stored in localStorage should also be 8 now:
    var storedValue3 = localStorage.getItem('todos-elmish_' + id);
    t.equal(storedValue3 !== null ? JSON.parse(storedValue3) : null, 8, "todos-elmish_store is 8 (as expected).");
    (0, elmish_1.empty)(root); // reset the DOM to simulate refreshing a browser window
    (0, elmish_1.mount)(5, update, view, id, function () { }); // 5 ignored! read model from localStorage
    // clearing DOM does NOT clear the localStorage (this is desired behaviour!)
    var storedValue4 = localStorage.getItem('todos-elmish_' + id);
    t.equal(storedValue4 !== null ? JSON.parse(storedValue4) : null, 8, "todos-elmish_store still 8 from increment (above) saved in localStorage");
    localStorage.removeItem('todos-elmish_' + id);
    t.end();
});
test('elmish.add_attributes onclick=signal(action) events!', function (t: Test) {
    var _a;
    var root = document.getElementById(id);
    (0, elmish_1.empty)(root);
    var counter = 0; // global to this test.
    function signal(action: string) {
        return function callback() {
            switch (action) {
                case 'inc':
                    counter++; // "mutating" ("impure") counters for test simplicity.
                    break;
            }
        };
    }
    if (root) {
        root.appendChild((0, elmish_1.add_attributes)(["id=btn", signal('inc')], document.createElement('button')));
    }
    // "click" the button!
    (_a = document.getElementById("btn")) === null || _a === void 0 ? void 0 : _a.click();
    // confirm that the counter was incremented by the onclick being triggered:
    t.equal(counter, 1, "Counter incremented via onclick attribute (function)!");
    (0, elmish_1.empty)(root);
    t.end();
});
test('subscriptions test using counter-reset-keyaboard ⌨️', function (t: Test) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    var _j = require('./counter-reset-keyboard.js'), view = _j.view, update = _j.update, subscriptions = _j.subscriptions;
    var root = document.getElementById(id);
    // mount the counter-reset-keyboard example app WITH subscriptions:
    (0, elmish_1.mount)(0, update, view, id, subscriptions);
    // counter starts off at 0 (zero):
    t.equal(parseInt(((_a = document.getElementById('count')) === null || _a === void 0 ? void 0 : _a.textContent) || '0', 10), 0, "Count is 0 (Zero) at start.");
    t.equal(JSON.parse(localStorage.getItem('todos-elmish_' + id) || '0'), 0, "todos-elmish_store is 0 (as expected). initial state saved to localStorage.");
    // trigger the [↑] (up) keyboard key to increment the counter:
    document.dispatchEvent(new KeyboardEvent('keyup', { 'keyCode': 38 })); // up
    t.equal(parseInt(((_b = document.getElementById('count')) === null || _b === void 0 ? void 0 : _b.textContent) || '0', 10), 1, "Up key press increment 0 -> 1");
    t.equal(JSON.parse(localStorage.getItem('todos-elmish_' + id) || '0'), 1, "todos-elmish_store 1 (as expected). incremented state saved to localStorage.");
    // trigger the [↓] (down) keyboard key to increment the counter:
    document.dispatchEvent(new KeyboardEvent('keyup', { 'keyCode': 40 })); // down
    t.equal(parseInt(((_c = document.getElementById('count')) === null || _c === void 0 ? void 0 : _c.textContent) || '0', 10), 0, "Up key press dencrement 1 -> 0");
    t.equal(JSON.parse(localStorage.getItem('todos-elmish_' + id) || '0'), 0, "todos-elmish_store 0. keyboard down key decrement state saved to localStorage.");
    // subscription keyCode trigger "branch" test (should NOT fire the signal):
    var clone = (_d = document.getElementById(id)) === null || _d === void 0 ? void 0 : _d.cloneNode(true);
    document.dispatchEvent(new KeyboardEvent('keyup', { 'keyCode': 42 })); //
    t.deepEqual(document.getElementById(id), clone, "#" + id + " no change");
    // default branch execution:
    (_e = document.getElementById('inc')) === null || _e === void 0 ? void 0 : _e.click();
    t.equal(parseInt(((_f = document.getElementById('count')) === null || _f === void 0 ? void 0 : _f.textContent) || '0', 10), 1, "inc: 0 -> 1");
    (_g = document.getElementById('reset')) === null || _g === void 0 ? void 0 : _g.click();
    t.equal(parseInt(((_h = document.getElementById('count')) === null || _h === void 0 ? void 0 : _h.textContent) || '0', 10), 0, "reset: 1 -> 0");
    var no_change = update(null, 7);
    t.equal(no_change, 7, "no change in model if action is unrecognised.");
    localStorage.removeItem('todos-elmish_' + id);
    (0, elmish_1.empty)(root);
    t.end();
});
