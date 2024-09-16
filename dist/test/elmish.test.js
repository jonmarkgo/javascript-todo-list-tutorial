var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { expect } from 'chai';
import { describe, it, before, after, beforeEach, afterEach } from 'mocha';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { LocalStorage } from 'node-localstorage';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8');
const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    resources: 'usable',
    url: `file://${path.resolve(__dirname, '..')}/`,
    contentType: "text/html",
});
global.document = dom.window.document;
global.window = dom.window;
// Import elmish after setting up JSDOM
import * as elmish from '../dist/elmish.js';
const id = 'test-app'; // all tests use separate root element
describe('elmish', () => {
    before(() => {
        const testApp = document.createElement('div');
        testApp.id = id;
        document.body.appendChild(testApp);
    });
    after(() => {
        const testApp = document.getElementById(id);
        if (testApp) {
            document.body.removeChild(testApp);
        }
    });
    describe('empty', () => {
        it('removes DOM elements from container', () => {
            const root = document.getElementById(id);
            expect(root).to.exist;
            if (!root)
                return;
            const div = document.createElement('div');
            div.id = 'mydiv';
            div.textContent = 'Hello World!';
            root.appendChild(div);
            expect(root.childElementCount).to.equal(1, `Root element ${id} has 1 child element`);
            elmish.empty(root);
            expect(root.childElementCount).to.equal(0, "After empty(root) has 0 child elements");
        });
    });
});
describe('mount app', () => {
    it('expects state to be Zero after reset', () => __awaiter(void 0, void 0, void 0, function* () {
        // use view and update from counter-reset example
        // to confirm that our mount function is generic!
        const { view, update } = yield import('./counter.js');
        const root = document.getElementById(id);
        expect(root).to.exist;
        if (!root)
            return;
        elmish.mount(7, update, view, id, () => { });
        const actualElement = document.getElementById(id);
        expect(actualElement).to.exist;
        if (!actualElement)
            return;
        const actual = actualElement.textContent;
        expect(actual).to.exist;
        if (!actual)
            return;
        const actual_stripped = parseInt(actual.replace('+', '').replace('-Reset', ''), 10);
        const expected = 7;
        expect(actual_stripped).to.equal(expected, "Initial state set to 7.");
        // reset to zero:
        const btn = root.querySelector(".reset");
        expect(btn).to.exist;
        if (!btn)
            return;
        btn.click(); // Click the Reset button!
        const countElement = root.querySelector('.count');
        expect(countElement).to.exist;
        if (!countElement)
            return;
        const state = parseInt(countElement.textContent || '0', 10);
        expect(state).to.equal(0, "State is 0 (Zero) after reset.");
        elmish.empty(root); // clean up after tests
    }));
});
describe('add_attributes', () => {
    it('adds "autofocus" attribute', () => {
        const { document } = (new JSDOM(`<!DOCTYPE html><div id="${id}"></div>`)).window;
        const container = document.getElementById(id);
        if (!container) {
            throw new Error('Container element not found');
        }
        const inputElement = elmish.add_attributes(["class=new-todo", "autofocus", "id=new"], document.createElement('input'));
        container.appendChild(inputElement);
        expect(inputElement).to.exist;
        expect(inputElement.className).to.equal('new-todo');
        expect(inputElement.id).to.equal('new');
        expect(inputElement.autofocus).to.be.true;
        // Note: The following assertion is commented out due to a breaking change in JSDOM
        // See: https://github.com/dwyl/javascript-todo-list-tutorial/issues/29
        // expect(document.activeElement).to.equal(inputElement);
    });
    it('applies HTML class attribute to el', () => {
        const root = document.getElementById(id);
        expect(root).to.exist;
        if (!root)
            return;
        let div = document.createElement('div');
        div.id = 'divid';
        div = elmish.add_attributes(["class=apptastic"], div);
        root.appendChild(div);
        // test the div has the desired class:
        const nodes = document.getElementsByClassName('apptastic');
        expect(nodes.length).to.equal(1, "<div> has 'apptastic' CSS class applied");
    });
    it('applies id HTML attribute to a node', () => {
        var _a;
        const root = document.getElementById(id);
        expect(root).to.exist;
        if (!root)
            return;
        let el = document.createElement('section');
        el = elmish.add_attributes(["id=myid"], el);
        const text = 'hello world!';
        const txt = document.createTextNode(text);
        el.appendChild(txt);
        root.appendChild(el);
        const actual = (_a = document.getElementById('myid')) === null || _a === void 0 ? void 0 : _a.textContent;
        expect(actual).to.equal(text, "<section> has 'myid' id attribute");
        elmish.empty(root); // clear the "DOM"/"state" before next test
    });
});
it('elmish.add_attributes applies multiple attribute to node', () => {
    const root = document.getElementById(id);
    expect(root).to.exist;
    if (!root)
        return;
    elmish.empty(root);
    let el = document.createElement('span');
    el = elmish.add_attributes(["id=myid", "class=totes mcawesome"], el);
    const text = 'hello world';
    const txt = document.createTextNode(text);
    el.appendChild(txt);
    root.appendChild(el);
    const actualElement = document.getElementById('myid');
    expect(actualElement).to.exist;
    expect(actualElement === null || actualElement === void 0 ? void 0 : actualElement.textContent).to.equal(text, "<section> has 'myid' id attribute");
    expect(el.className).to.equal('totes mcawesome', "CSS class applied");
});
it('elmish.add_attributes sets placeholder on <input> element', () => {
    const root = document.getElementById(id);
    expect(root).to.exist;
    if (!root)
        return;
    let input = document.createElement('input');
    input.id = 'new-todo';
    input = elmish.add_attributes(["placeholder=What needs to be done?"], input);
    root.appendChild(input);
    const newTodoElement = document.getElementById('new-todo');
    expect(newTodoElement).to.exist;
    if (!newTodoElement)
        return;
    const placeholder = newTodoElement.getAttribute("placeholder");
    expect(placeholder).to.equal("What needs to be done?", "placeholder set on <input>");
});
it('elmish.add_attributes sets data-id on <li> element', () => {
    const root = document.getElementById(id);
    expect(root).to.exist;
    if (!root)
        return;
    let li = document.createElement('li');
    li.id = 'task1';
    li = elmish.add_attributes(["data-id=123"], li);
    root.appendChild(li);
    const taskElement = document.getElementById('task1');
    expect(taskElement).to.exist;
    if (!taskElement)
        return;
    const data_id = taskElement.getAttribute("data-id");
    expect(data_id).to.equal('123', "data-id successfully added to <li> element");
});
it('elmish.add_attributes sets "for" attribute on <label> element', () => {
    const root = document.getElementById(id);
    expect(root).to.exist;
    if (!root)
        return;
    let label = document.createElement('label');
    label.id = 'toggle';
    label = elmish.add_attributes(["for=toggle-all"], label);
    root.appendChild(label);
    const toggleElement = document.getElementById('toggle');
    expect(toggleElement).to.exist;
    if (!toggleElement)
        return;
    const label_for = toggleElement.getAttribute("for");
    expect(label_for).to.equal("toggle-all", '<label for="toggle-all">');
});
it('elmish.add_attributes adds type="checkbox" on <input> element', () => {
    const root = document.getElementById(id);
    expect(root).to.exist;
    if (!root)
        return;
    let input = document.createElement('input');
    input = elmish.add_attributes(["type=checkbox", "id=toggle-all"], input);
    root.appendChild(input);
    const toggleAllElement = document.getElementById('toggle-all');
    expect(toggleAllElement).to.exist;
    if (!toggleAllElement)
        return;
    const type_attr = toggleAllElement.getAttribute("type");
    expect(type_attr).to.equal("checkbox", '<input id="toggle-all" type="checkbox">');
});
it('elmish.add_attributes applies style="display: block;"', () => {
    const root = document.getElementById(id);
    expect(root).to.exist;
    if (!root)
        return;
    elmish.empty(root);
    const sec = document.createElement('section');
    const attributedSec = elmish.add_attributes(["id=main", "style=display: block;"], sec);
    root.appendChild(attributedSec);
    const mainElement = document.getElementById('main');
    expect(mainElement).to.exist;
    if (!mainElement)
        return;
    const style = window.getComputedStyle(mainElement);
    expect(style.display).to.equal('block', 'style="display: block;" applied!');
});
it('elmish.add_attributes sets checked=true on "done" item', () => {
    const root = document.getElementById(id);
    expect(root).to.exist;
    if (!root)
        return;
    elmish.empty(root);
    let input = document.createElement('input');
    input = elmish.add_attributes(["type=checkbox", "id=item1", "checked=true"], input);
    root.appendChild(input);
    const checkedElement = document.getElementById('item1');
    expect(checkedElement).to.exist;
    expect(checkedElement.checked).to.be.true;
    // test "checked=false" so we know we are able to "toggle" a todo item:
    const uncheckedInput = elmish.add_attributes(["type=checkbox", "id=item2"], document.createElement('input'));
    root.appendChild(uncheckedInput);
    const uncheckedElement = document.getElementById('item2');
    expect(uncheckedElement).to.exist;
    expect(uncheckedElement.checked).to.be.false;
});
it('elmish.add_attributes sets <a href="#/active">Active</a>', () => {
    const root = document.getElementById(id);
    expect(root).to.exist;
    if (!root)
        return;
    elmish.empty(root);
    const anchorElement = elmish.add_attributes(["href=#/active", "class=selected", "id=active"], document.createElement('a'));
    root.appendChild(anchorElement);
    const activeElement = document.getElementById('active');
    expect(activeElement).to.exist;
    if (!activeElement)
        return;
    // Use URL parsing to handle different protocols (file:// or http://)
    const url = new URL(activeElement.href);
    expect(url.hash).to.equal("#/active", 'href="#/active" applied to "active" link');
});
/** DEFAULT BRANCH **/
it('should not alter the element when using unrecognized attribute', () => {
    const root = document.getElementById(id);
    expect(root).to.exist;
    if (!root)
        return;
    let div = document.createElement('div');
    div.id = 'divid';
    // "Clone" the div DOM node before invoking elmish.attributes to compare
    const clone = div.cloneNode(true);
    div = elmish.add_attributes(["unrecognised_attribute=noise"], div);
    expect(div).to.deep.equal(clone, "<div> has not been altered");
});
/** null attrlist **/
it('should not alter the element when attrlist is null', () => {
    const root = document.getElementById(id);
    expect(root).to.exist;
    if (!root)
        return;
    let div = document.createElement('div');
    div.id = 'divid';
    // "Clone" the div DOM node before invoking elmish.attributes to compare
    const clone = div.cloneNode(true);
    div = elmish.add_attributes(null, div); // should not "explode"
    expect(div).to.deep.equal(clone, "<div> has not been altered");
});
it('should append child DOM nodes to parent', () => {
    const root = document.getElementById(id);
    expect(root).to.exist;
    if (!root)
        return;
    elmish.empty(root); // clear the test DOM before!
    const div = document.createElement('div');
    const p = document.createElement('p');
    const section = document.createElement('section');
    elmish.append_childnodes([div, p, section], root);
    expect(root.childElementCount).to.equal(3, `Root element ${id} has 3 child elements`);
});
it('elmish.section creates a <section> HTML element', () => {
    const p = document.createElement('p');
    p.id = 'para';
    const text = 'Hello World!';
    const txt = document.createTextNode(text);
    p.appendChild(txt);
    // create the `<section>` HTML element using our section function
    const section = elmish.section(["class=new-todo"], [p]);
    const container = document.getElementById(id);
    expect(container).to.exist;
    if (!container)
        return;
    container.appendChild(section); // add section with <p>
    // document.activeElement via: https://stackoverflow.com/a/17614883/1148249
    const paraElement = document.getElementById('para');
    expect(paraElement).to.exist;
    expect(paraElement === null || paraElement === void 0 ? void 0 : paraElement.textContent).to.equal(text, '<section> <p>' + text + '</p></section> works as expected!');
    elmish.empty(container);
});
it('should create <header> view using HTML element functions', () => {
    const { append_childnodes, section, header, h1, text, input } = elmish;
    const container = document.getElementById(id);
    expect(container).to.exist;
    if (!container)
        return;
    append_childnodes([
        section(["class=todoapp"], [
            header(["class=header"], [
                h1([], [
                    text("todos")
                ]), // </h1>
                input([
                    "id=new",
                    "class=new-todo",
                    "placeholder=What needs to be done?",
                    "autofocus"
                ], []) // <input> is "self-closing"
            ]) // </header>
        ])
    ], container);
    const newElement = document.getElementById('new');
    expect(newElement).to.exist;
    if (!newElement)
        return;
    const place = newElement.getAttribute('placeholder');
    expect(place).to.equal("What needs to be done?", "placeholder set in <input> el");
    const h1Element = document.querySelector('h1');
    expect(h1Element).to.exist;
    expect(h1Element === null || h1Element === void 0 ? void 0 : h1Element.textContent).to.equal('todos', '<h1>todos</h1>');
    elmish.empty(container);
});
it('creates "main" view using HTML DOM functions', () => {
    const { section, input, label, ul, li, div, button, text } = elmish;
    const container = document.getElementById(id);
    expect(container).to.exist;
    if (!container)
        return;
    elmish.append_childnodes([
        section(["class=main", "style=display: block;"], [
            input(["id=toggle-all", "class=toggle-all", "type=checkbox"], []),
            label(["for=toggle-all"], [text("Mark all as complete")]),
            ul(["class=todo-list"], [
                li(["data-id=123", "class=completed"], [
                    div(["class=view"], [
                        input(["class=toggle", "type=checkbox", "checked=true"], []),
                        label([], [text('Learn The Elm Architecture ("TEA")')]),
                        button(["class=destroy"])
                    ]) // </div>
                ]), // </li>
                li(["data-id=234"], [
                    div(["class=view"], [
                        input(["class=toggle", "type=checkbox"], []),
                        label([], [text("Build TEA Todo List App")]),
                        button(["class=destroy"])
                    ]) // </div>
                ]) // </li>
            ]) // </ul>
        ])
    ], container);
    const doneElement = document.querySelector('.completed');
    expect(doneElement).to.exist;
    expect(doneElement === null || doneElement === void 0 ? void 0 : doneElement.textContent).to.equal('Learn The Elm Architecture ("TEA")', 'Done: Learn "TEA"');
    const todoElements = document.querySelectorAll('.view');
    expect(todoElements.length).to.be.at.least(2);
    expect(todoElements[1].textContent).to.equal('Build TEA Todo List App', 'Todo: Build TEA Todo List App');
    elmish.empty(container);
});
it('creates <footer> view using HTML DOM functions', () => {
    const { footer, span, strong, text, ul, li, a, button } = elmish;
    const container = document.getElementById(id);
    expect(container).to.exist;
    if (!container)
        return;
    elmish.append_childnodes([
        footer(["class=footer", "style=display: block;"], [
            span(["class=todo-count", "id=count"], [
                strong("1"),
                text(" item left")
            ]),
            ul(["class=filters"], [
                li([], [
                    a(["href=#/", "class=selected"], [text("All")])
                ]),
                li([], [
                    a(["href=#/active"], [text("Active")])
                ]),
                li([], [
                    a(["href=#/completed"], [text("Completed")])
                ])
            ]), // </ul>
            button(["class=clear-completed", "style=display:block;"], [text("Clear completed")])
        ])
    ], container);
    // count of items left:
    const countElement = document.getElementById('count');
    expect(countElement).to.exist;
    if (countElement) {
        const left = countElement.textContent;
        expect(left).to.equal("1 item left", 'there is 1 (ONE) todo item left');
    }
    const clearButton = document.querySelector('button');
    expect(clearButton).to.exist;
    if (clearButton) {
        expect(clearButton.textContent).to.equal("Clear completed", '<button> text is "Clear completed"');
    }
    const selectedElement = document.querySelector('.selected');
    expect(selectedElement).to.exist;
    if (selectedElement) {
        expect(selectedElement.textContent).to.equal("All", "All is selected by default");
    }
    elmish.empty(container);
});
describe('elmish.route', () => {
    it('updates the url hash and sets history', () => {
        const initial_hash = window.location.hash;
        console.log('START window.location.hash:', initial_hash, '(empty string)');
        const initial_history_length = window.history.length;
        console.log('START window.history.length:', initial_history_length);
        // update the URL Hash and Set Browser History
        const state = { hash: '' };
        const new_hash = '#/active';
        const new_state = elmish.route(state, 'Active', new_hash);
        console.log('UPDATED window.history.length:', window.history.length);
        console.log('UPDATED state:', new_state);
        console.log('UPDATED window.location.hash:', window.location.hash);
        expect(window.location.hash).to.not.equal(initial_hash, "location.hash has changed!");
        expect(new_state.hash).to.equal(new_hash, `state.hash is now: ${new_state.hash}`);
        expect(window.location.hash).to.equal(new_hash, `window.location.hash: ${window.location.hash}`);
        expect(window.history.length).to.equal(initial_history_length + 1, `window.history.length increased from: ${initial_history_length} to: ${window.history.length}`);
    });
});
const localStorageMock = new LocalStorage('./scratch');
Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true
});
// Ensure localStorage is available in the JSDOM environment
global.localStorage = localStorageMock;
// Clear localStorage before each test
beforeEach(() => {
    localStorage.clear();
});
// Clean up after all tests
afterEach(() => {
    localStorage.clear();
});
// Final cleanup after all tests
after(() => {
    localStorage.clear();
});
// Remove the test-specific localStorage item
afterEach(() => {
    localStorage.removeItem('todos-elmish_' + id);
});
describe('elmish.mount', () => {
    it('sets model in localStorage and handles re-mounting correctly', () => __awaiter(void 0, void 0, void 0, function* () {
        const { view, update } = yield import('./counter.js');
        const root = document.getElementById(id);
        expect(root).to.exist;
        if (!root)
            return;
        elmish.mount(7, update, view, id, () => { });
        // the "model" stored in localStorage should be 7 now:
        const storedModel = localStorage.getItem('todos-elmish_' + id);
        expect(storedModel).to.not.be.null;
        expect(JSON.parse(storedModel)).to.equal(7, "todos-elmish_store is 7 (as expected). initial state saved to localStorage.");
        // test that mount still works as expected (check initial state of counter):
        const actual = root.textContent;
        expect(actual).to.exist;
        if (!actual)
            return;
        const actual_stripped = parseInt(actual.replace('+', '').replace('-Reset', ''), 10);
        const expected = 7;
        expect(actual_stripped).to.equal(expected, "Initial state set to 7.");
        // attempting to "re-mount" with a different model value should not work
        // because mount should retrieve the value from localStorage
        elmish.mount(42, update, view, id, () => { }); // model (42) should be ignored this time!
        const storedModelAfterRemount = localStorage.getItem('todos-elmish_' + id);
        expect(storedModelAfterRemount).to.not.be.null;
        expect(JSON.parse(storedModelAfterRemount)).to.equal(7, "todos-elmish_store is 7 (as expected). initial state saved to localStorage.");
        // increment the counter
        const btn = root.querySelector(".inc");
        expect(btn).to.exist;
        if (!btn)
            return;
        btn.click(); // Click the Increment button!
        const countElement = root.querySelector('.count');
        expect(countElement).to.exist;
        if (!countElement)
            return;
        const state = parseInt(countElement.textContent || '0', 10);
        expect(state).to.equal(8, "State is 8 after increment.");
        // the "model" stored in localStorage should also be 8 now:
        const storedModelAfterIncrement = localStorage.getItem('todos-elmish_' + id);
        expect(storedModelAfterIncrement).to.not.be.null;
        expect(JSON.parse(storedModelAfterIncrement)).to.equal(8, "todos-elmish_store is 8 (as expected).");
        elmish.empty(root); // reset the DOM to simulate refreshing a browser window
        elmish.mount(5, update, view, id, () => { }); // 5 ignored! read model from localStorage
        // clearing DOM does NOT clear the localStorage (this is desired behaviour!)
        const finalStoredModel = localStorage.getItem('todos-elmish_' + id);
        expect(finalStoredModel).to.not.be.null;
        expect(JSON.parse(finalStoredModel)).to.equal(8, "todos-elmish_store still 8 from increment (above) saved in localStorage");
        localStorage.removeItem('todos-elmish_' + id);
    }));
});
it('elmish.add_attributes onclick=signal(action) events!', function () {
    const root = document.getElementById(id);
    expect(root).to.exist;
    if (!root)
        return;
    elmish.empty(root);
    let counter = 0; // global to this test.
    function signal(action) {
        return function callback() {
            switch (action) {
                case 'inc':
                    counter++; // "mutating" ("impure") counters for test simplicity.
                    break;
            }
        };
    }
    const button = document.createElement('button');
    const attributedButton = elmish.add_attributes(["id=btn", signal('inc')], button);
    root.appendChild(attributedButton);
    // "click" the button!
    const btnElement = document.getElementById("btn");
    expect(btnElement).to.exist;
    btnElement.click();
    // confirm that the counter was incremented by the onclick being triggered:
    expect(counter).to.equal(1, "Counter incremented via onclick attribute (function)!");
    elmish.empty(root);
});
describe('subscriptions test using counter-reset-keyboard ⌨️', () => {
    it('should handle keyboard events correctly', () => __awaiter(void 0, void 0, void 0, function* () {
        const { view, update, subscriptions } = yield import('./counter-reset-keyboard.js');
        const root = document.getElementById(id);
        expect(root).to.exist;
        if (!root)
            return;
        // mount the counter-reset-keyboard example app WITH subscriptions:
        elmish.mount(0, update, view, id, subscriptions);
        // counter starts off at 0 (zero):
        const countElement = document.getElementById('count');
        expect(countElement).to.exist;
        if (!countElement)
            return;
        expect(parseInt(countElement.textContent || '0', 10)).to.equal(0, "Count is 0 (Zero) at start.");
        const initialStoredValue = localStorage.getItem('todos-elmish_' + id);
        expect(initialStoredValue).to.not.be.null;
        expect(JSON.parse(initialStoredValue)).to.equal(0, "todos-elmish_store is 0 (as expected). initial state saved to localStorage.");
        // trigger the [↑] (up) keyboard key to increment the counter:
        document.dispatchEvent(new KeyboardEvent('keyup', { 'key': 'ArrowUp' }));
        expect(parseInt(countElement.textContent || '0', 10)).to.equal(1, "Up key press increment 0 -> 1");
        const incrementedStoredValue = localStorage.getItem('todos-elmish_' + id);
        expect(incrementedStoredValue).to.not.be.null;
        expect(JSON.parse(incrementedStoredValue)).to.equal(1, "todos-elmish_store 1 (as expected). incremented state saved to localStorage.");
        // trigger the [↓] (down) keyboard key to decrement the counter:
        document.dispatchEvent(new KeyboardEvent('keyup', { 'key': 'ArrowDown' }));
        expect(parseInt(countElement.textContent || '0', 10)).to.equal(0, "Down key press decrement 1 -> 0");
        const decrementedStoredValue = localStorage.getItem('todos-elmish_' + id);
        expect(decrementedStoredValue).to.not.be.null;
        expect(JSON.parse(decrementedStoredValue)).to.equal(0, "todos-elmish_store 0. keyboard down key decrement state saved to localStorage.");
        // subscription keyCode trigger "branch" test (should NOT fire the signal):
        const clone = root.cloneNode(true);
        document.dispatchEvent(new KeyboardEvent('keyup', { 'key': 'F6' }));
        expect(root).to.deep.equal(clone, `#${id} no change`);
        // default branch execution:
        const incButton = document.getElementById('inc');
        expect(incButton).to.exist;
        if (incButton) {
            incButton.click();
            expect(parseInt(countElement.textContent || '0', 10)).to.equal(1, "inc: 0 -> 1");
        }
        const resetButton = document.getElementById('reset');
        expect(resetButton).to.exist;
        if (resetButton) {
            resetButton.click();
            expect(parseInt(countElement.textContent || '0', 10)).to.equal(0, "reset: 1 -> 0");
        }
        const no_change = update('UNKNOWN_ACTION', 7);
        expect(no_change).to.equal(7, "no change in model if action is unrecognised.");
        localStorage.removeItem('todos-elmish_' + id);
        elmish.empty(root);
    }));
});
