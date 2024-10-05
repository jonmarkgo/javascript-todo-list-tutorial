import test from 'tape';       // https://github.com/dwyl/learn-tape
import fs from 'fs';           // read html files (see below)
import path from 'path';       // so we can open files cross-platform
import * as elmish from '../lib/elmish';
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'));
require('jsdom-global')(html);   // https://github.com/rstacruz/jsdom-global
import jsdom from "jsdom";
const { JSDOM } = jsdom;
const id = 'test-app';              // all tests use separate root element

test('elmish.empty("root") removes DOM elements from container', function (t) {
  // setup the test div:
  const text = 'Hello World!'
  const divid = "mydiv";
  const root = document.getElementById(id) as HTMLElement;
  const div = document.createElement('div');
  div.id = divid;
  const txt = document.createTextNode(text);
  div.appendChild(txt);
  root.appendChild(div);
  // check text of the div:
  const actual = document.getElementById(divid)?.textContent;
  t.equal(actual, text, "Contents of mydiv is: " + actual + ' == ' + text);
  t.equal(root.childElementCount, 1, "Root element " + id + " has 1 child el");
  // empty the root DOM node:
  elmish.empty(root); // exercise the `empty` function!
  t.equal(root.childElementCount, 0, "After empty(root) has 0 child elements!")
  t.end();
});


test('elmish.mount app expect state to be Zero', function (t) {
  // use view and update from counter-reset example
  // to confirm that our elmish.mount function is generic!
  const { view, update } = require('./counter.js');

  const root = document.getElementById(id) as HTMLElement;
  elmish.mount({ todos: [], count: 7 }, update, view, id);
  const actual = document.getElementById(id)?.textContent;
  const actual_stripped = parseInt(actual?.replace('+', '')
    .replace('-Reset', '') ?? '', 10);
  const expected = 7;
  t.equal(expected, actual_stripped, "Inital state set to 7.");
  // reset to zero:
  console.log('root', root);
  const btn = root.querySelector(".reset") as HTMLElement; // click reset button
  btn.click(); // Click the Reset button!
  const state = parseInt((root.querySelector('.count') as HTMLElement)
    .textContent ?? '', 10);
  t.equal(state, 0, "State is 0 (Zero) after reset."); // state reset to 0!
  elmish.empty(root); // clean up after tests
  t.end()
});


test('elmish.add_attributes adds "autofocus" attribute', function (t) {
  const { document } = (new JSDOM(`<!DOCTYPE html><div id="${id}"></div>`)).window;

  document.getElementById(id)?.appendChild(
    elmish.add_attributes(["class=new-todo", "autofocus", "id=new"],
      document.createElement('input')
    )
  );
  // document.activeElement via: https://stackoverflow.com/a/17614883/1148249
  // t.deepEqual(document.getElementById('new'), document.activeElement,
  //   '<input autofocus> is in "focus"');

  // This assertion is commented because of a broking change in JSDOM see:
  // https://github.com/dwyl/javascript-todo-list-tutorial/issues/29

  t.end();
});

test('elmish.add_attributes applies HTML class attribute to el', function (t) {
  const root = document.getElementById(id) as HTMLElement;
  let div = document.createElement('div') as HTMLDivElement;
  div.id = 'divid';
  div = elmish.add_attributes(["class=apptastic"], div) as HTMLDivElement;
  root.appendChild(div);
  // test the div has the desired class:
  const nodes = document.getElementsByClassName('apptastic');
  t.equal(nodes.length, 1, "<div> has 'apptastic' CSS class applied");
  t.end();
});

test('elmish.add_attributes applies id HTML attribute to a node', function (t) {
  const root = document.getElementById(id) as HTMLElement;
  let el = document.createElement('section');
  el = elmish.add_attributes(["id=myid"], el);
  const text = 'hello world!'
  var txt = document.createTextNode(text);
  el.appendChild(txt);
  root.appendChild(el);
  const actual = document.getElementById('myid')?.textContent;
  t.equal(actual, text, "<section> has 'myid' id attribute");
  elmish.empty(root); // clear the "DOM"/"state" before next test
  t.end();
});

test('elmish.add_attributes applies multiple attribute to node', function (t) {
  const root = document.getElementById(id) as HTMLElement;
  elmish.empty(root);
  let el = document.createElement('span');
  el = elmish.add_attributes(["id=myid", "class=totes mcawesome"], el);
  const text = 'hello world'
  var txt = document.createTextNode(text);
  el.appendChild(txt);
  root.appendChild(el);
  const actual = document.getElementById('myid')?.textContent;
  t.equal(actual, text, "<section> has 'myid' id attribute");
  t.equal(el.className, 'totes mcawesome', "CSS class applied: " + el.className);
  t.end();
});

test('elmish.add_attributes set placeholder on <input> element', function (t) {
  const root = document.getElementById(id) as HTMLElement;
  let input = document.createElement('input') as HTMLInputElement;
  input.id = 'new-todo';
  input = elmish.add_attributes(["placeholder=What needs to be done?"], input) as HTMLInputElement;
  root.appendChild(input);
  const placeholder = document.getElementById('new-todo')
    ?.getAttribute("placeholder");
  t.equal(placeholder, "What needs to be done?", "paceholder set on <input>");
  t.end();
});

test('elmish.add_attributes set data-id on <li> element', function (t) {
  const root = document.getElementById(id) as HTMLElement;
  let li = document.createElement('li') as HTMLLIElement;
  li.id = 'task1';
  li = elmish.add_attributes(["data-id=123"], li) as HTMLLIElement;
  root.appendChild(li);
  const data_id = document.getElementById('task1')?.getAttribute("data-id");
  t.equal(data_id, '123', "data-id successfully added to <li> element");
  t.end();
});

test('elmish.add_attributes set "for" attribute <label> element', function (t) {
  const root = document.getElementById(id) as HTMLElement;
  let li = document.createElement('li') as HTMLLIElement;
  li.id = 'toggle';
  li = elmish.add_attributes(["for=toggle-all"], li) as HTMLLIElement;
  root.appendChild(li);
  const label_for = document.getElementById('toggle')?.getAttribute("for");
  t.equal(label_for, "toggle-all", '<label for="toggle-all">');
  t.end();
});

test('elmish.add_attributes type="checkbox" on <input> element', function (t) {
  const root = document.getElementById(id) as HTMLElement;
  let input = document.createElement('input') as HTMLInputElement;
  input = elmish.add_attributes(["type=checkbox", "id=toggle-all"], input) as HTMLInputElement;
  root.appendChild(input);
  const type_atrr = document.getElementById('toggle-all')?.getAttribute("type");
  t.equal(type_atrr, "checkbox", '<input id="toggle-all" type="checkbox">');
  t.end();
});

test('elmish.add_attributes apply style="display: block;"', function (t) {
  const root = document.getElementById(id) as HTMLElement;
  elmish.empty(root);
  let sec = document.createElement('section');
  root.appendChild(
    elmish.add_attributes(["id=main", "style=display: block;"], sec)
  );
  const style = window.getComputedStyle(document.getElementById('main') as HTMLElement);
  t.equal(style.display, 'block', 'style="display: block;" applied!')
  t.end();
});

test('elmish.add_attributes checked=true on "done" item', function (t) {
  const root = document.getElementById(id) as HTMLElement;
  elmish.empty(root);
  let input = document.createElement('input') as HTMLInputElement;
  input = elmish.add_attributes(["type=checkbox", "id=item1", "checked=true"],
    input) as HTMLInputElement;
  root.appendChild(input);
  const checked = (document.getElementById('item1') as HTMLInputElement).checked;
  t.equal(checked, true, '<input type="checkbox" checked="checked">');
  // test "checked=false" so we know we are able to "toggle" a todo item:
  root.appendChild(
    elmish.add_attributes(
      ["type=checkbox", "id=item2"],
      document.createElement('input')
    )
  );
  t.equal((document.getElementById('item2') as HTMLInputElement).checked, false, 'checked=false');
  t.end();
});

test('elmish.add_attributes <a href="#/active">Active</a>', function (t) {
  const root = document.getElementById(id) as HTMLElement;
  elmish.empty(root);
  root.appendChild(
    elmish.add_attributes(["href=#/active", "class=selected", "id=active"],
      document.createElement('a')
    )
  );
  // note: "about:blank" is the JSDOM default "window.location.href"
  console.log('JSDOM window.location.href:', window.location.href);
  // so when an href is set *relative* to this it becomes "about:blank#/my-link"
  // so we *remove* it before the assertion below, but it works fine in browser!
  const href = (document.getElementById('active') as HTMLAnchorElement).href.replace('about:blank', '')
  t.equal(href, "#/active", 'href="#/active" applied to "active" link');
  t.end();
});

/** DEFAULT BRANCH **/
test('test default branch of elmish.add_attributes (no effect)', function (t) {
  const root = document.getElementById(id);
  let div = document.createElement('div') as HTMLDivElement;
  div.id = 'divid';
  // "Clone" the div DOM node before invoking elmish.attributes to compare
  const clone = div.cloneNode(true);
  div = elmish.add_attributes(["unrecognised_attribute=noise"], div) as HTMLDivElement;
  t.deepEqual(div, clone, "<div> has not been altered");
  t.end();
});

/** null attrlist **/
test('test elmish.add_attributes attrlist null (no effect)', function (t) {
  const root = document.getElementById(id);
  let div = document.createElement('div') as HTMLDivElement;
  div.id = 'divid';
  // "Clone" the div DOM node before invoking elmish.attributes to compare
  const clone = div.cloneNode(true);
  div = elmish.add_attributes([], div) as HTMLDivElement; // should not "explode"
  t.deepEqual(div, clone, "<div> has not been altered");
  t.end();
});

test('elmish.append_childnodes append child DOM nodes to parent', function (t) {
  const root = document.getElementById(id) as HTMLElement | null;
  if (root) {
    elmish.empty(root); // clear the test DOM before!
    let div = document.createElement('div');
    let p = document.createElement('p');
    let section = document.createElement('section');
    elmish.append_childnodes([div, p, section], root);
    t.equal(root.childElementCount, 3, "Root element " + id + " has 3 child els");
  } else {
    t.fail("Root element not found");
  }
  t.end();
});

test('elmish.section creates a <section> HTML element', function (t) {
  const p = document.createElement('p');
  p.id = 'para';
  const text = 'Hello World!'
  const txt = document.createTextNode(text);
  p.appendChild(txt);
  // create the `<section>` HTML element using our section function
  const section = elmish.section(["class=new-todo"], [p])
  const rootElement = document.getElementById(id);
  if (rootElement) {
    rootElement.appendChild(section); // add section with <p>
    // document.activeElement via: https://stackoverflow.com/a/17614883/1148249
    const paraElement = document.getElementById('para');
    if (paraElement) {
      t.equal(paraElement.textContent, text,
        '<section> <p>' + text + '</p></section> works as expected!');
    } else {
      t.fail("Paragraph element not found");
    }
    elmish.empty(rootElement);
  } else {
    t.fail("Root element not found");
  }
  t.end();
});

test('elmish create <header> view using HTML element functions', function (t) {
  const { append_childnodes, section, header, h1, text, input } = elmish;
  const rootElement = document.getElementById(id);
  if (rootElement) {
    append_childnodes([
      section(["class=todoapp"], [ // array of "child" elements
        header(["class=header"], [
          h1([], [
            text("todos") as unknown as HTMLElement
          ]), // </h1>
          input([
            "id=new",
            "class=new-todo",
            "placeholder=What needs to be done?",
            "autofocus"
          ], []) // <input> is "self-closing"
        ]) // </header>
      ])
    ], rootElement);

    const newElement = document.getElementById('new');
    if (newElement) {
      const place = newElement.getAttribute('placeholder');
      t.equal(place, "What needs to be done?", "placeholder set in <input> el");
    } else {
      t.fail("New element not found");
    }

    const h1Element = document.querySelector('h1');
    if (h1Element) {
      t.equal(h1Element.textContent, 'todos', '<h1>todos</h1>');
    } else {
      t.fail("H1 element not found");
    }

    elmish.empty(rootElement);
  } else {
    t.fail("Root element not found");
  }
  t.end();
});

test('elmish create "main" view using HTML DOM functions', function (t) {
  const { section, input, label, ul, li, div, button, text } = elmish;
  elmish.append_childnodes([
    section(["class=main", "style=display: block;"], [
      input(["id=toggle-all", "class=toggle-all", "type=checkbox"], []),
      label(["for=toggle-all"], [ text("Mark all as complete") as unknown as HTMLElement ]),
      ul(["class=todo-list"], [
        li(["data-id=123", "class=completed"], [
          div(["class=view"], [
            input(["class=toggle", "type=checkbox", "checked=true"], []),
            label([], [text('Learn The Elm Architecture ("TEA")') as unknown as HTMLElement]),
            button(["class=destroy"], [])
          ]) // </div>
        ]), // </li>
        li(["data-id=234"], [
          div(["class=view"], [
            input(["class=toggle", "type=checkbox"], []),
            label([], [text("Build TEA Todo List App") as unknown as HTMLElement]),
            button(["class=destroy"], [])
          ]) // </div>
        ]) // </li>
      ]) // </ul>
    ])
  ], document.getElementById(id) as HTMLElement);
  const done = document.querySelectorAll('.completed')[0]?.textContent;
  t.equal(done, 'Learn The Elm Architecture ("TEA")', 'Done: Learn "TEA"');
  const todo = document.querySelectorAll('.view')[1]?.textContent;
  t.equal(todo, 'Build TEA Todo List App', 'Todo: Build TEA Todo List App');
  elmish.empty(document.getElementById(id) as HTMLElement);
  t.end();
});

test('elmish create <footer> view using HTML DOM functions', function (t) {
  const { footer, span, strong, text, ul, li, a, button } = elmish;
  elmish.append_childnodes([
    footer(["class=footer", "style=display: block;"], [
      span(["class=todo-count", "id=count"], [
        strong("1"),
        text(" item left") as unknown as HTMLElement
      ]),
      ul(["class=filters"], [
        li([], [
          a(["href=#/", "class=selected"], [text("All") as unknown as HTMLElement])
        ]),
        li([], [
          a(["href=#/active"], [text("Active") as unknown as HTMLElement])
        ]),
        li([], [
          a(["href=#/completed"], [text("Completed") as unknown as HTMLElement])
        ])
      ]), // </ul>
      button(["class=clear-completed", "style=display:block;"],
        [text("Clear completed") as unknown as HTMLElement]
      )
    ])
  ], document.getElementById(id) as HTMLElement);

  // count of items left:
  const countElement = document.getElementById('count');
  const left = countElement ? countElement.textContent : null;
  t.equal("1 item left", left, 'there is 1 (ONE) todo item left');

  const clearButton = document.querySelectorAll('button')[0];
  const clear = clearButton ? clearButton.textContent : null;
  t.equal(clear, "Clear completed", '<button> text is "Clear completed"');
  const selectedElement = document.querySelectorAll('.selected')[0];
  const selected = selectedElement ? selectedElement.textContent : null;
  t.equal(selected, "All", "All is selected by default");
  const rootElement = document.getElementById(id);
  if (rootElement) {
    elmish.empty(rootElement);
  }
  t.end();
});

test('elmish.route updates the url hash and sets history', function (t) {
  const initial_hash = window.location.hash
  console.log('START window.location.hash:', initial_hash, '(empty string)');
  const initial_history_length = window.history.length;
  console.log('START window.history.length:', initial_history_length);
  // update the URL Hash and Set Browser History
  const state = { hash: '' };
  const new_hash = '#/active'
  const new_state = elmish.route(state, 'Active', new_hash);
  console.log('UPDATED window.history.length:', window.history.length);
  console.log('UPDATED state:', new_state);
  console.log('UPDATED window.location.hash:', window.location.hash);
  t.notEqual(initial_hash, window.location.hash, "location.hash has changed!");
  t.equal(new_hash, new_state.hash, "state.hash is now: " + new_state.hash);
  t.equal(new_hash, window.location.hash, "window.location.hash: "
    + window.location.hash);
  t.equal(initial_history_length + 1, window.history.length,
    "window.history.length increased from: " + initial_history_length + ' to: '
    + window.history.length);
  t.end();
});

// Testing localStorage requires "polyfil" because:
// https://github.com/jsdom/jsdom/issues/1137 ¯\_(ツ)_/¯
// globals are bad! but a "necessary evil" here ...
const localStoragePolyfill: Storage = {
  getItem: function(key: string): string | null {
   const value = this[key as keyof typeof this];
   return typeof value === 'undefined' ? null : String(value);
 },
 setItem: function (key: string, value: string): void {
   this[key as keyof typeof this] = value;
 },
 removeItem: function (key: string): void {
   delete this[key as keyof typeof this];
 },
 clear: function(): void {},
 key: function(index: number): string | null { return null; },
 length: 0
};

(global as any).localStorage = global.localStorage ? global.localStorage : localStoragePolyfill;
localStorage.removeItem('todos-elmish_' + id);
// localStorage.setItem('hello', 'world!');
// console.log('localStorage (polyfil) hello', localStorage.getItem('hello'));

// // Test mount's localStorage using view and update from counter-reset example
// // to confirm that our elmish.mount localStorage works and is "generic".
test('elmish.mount sets model in localStorage', function (t) {
  const { view, update } = require('./counter.js');
  const root = document.getElementById(id);

  elmish.mount({ todos: [], count: 7 }, update, view, id);
  // the "model" stored in localStorage should be 7 now:
  const storedValue = localStorage.getItem('todos-elmish_' + id);
  t.equal(storedValue !== null ? JSON.parse(storedValue) : null, { todos: [], count: 7 },
    "todos-elmish_store is { todos: [], count: 7 } (as expected). initial state saved to localStorage.");
  // test that mount still works as expected (check initial state of counter):
  const actual = root?.textContent;
  const actual_stripped = actual ? parseInt(actual.replace('+', '').replace('-Reset', ''), 10) : null;
  const expected = 7;
  t.equal(expected, actual_stripped, "Inital state set to 7.");
  // attempting to "re-mount" with a different model value should not work
  // because mount should retrieve the value from localStorage
  elmish.mount({ todos: [], count: 42 }, update, view, id); // model (42) should be ignored this time!

  const newStoredValue = localStorage.getItem('todos-elmish_' + id);
  t.equal(newStoredValue !== null ? JSON.parse(newStoredValue) : null, { todos: [], count: 7 },
    "todos-elmish_store is { todos: [], count: 7 } (as expected). initial state saved to localStorage.");
  // increment the counter
  const btn = root?.getElementsByClassName("inc")[0] as HTMLElement; // click increment button
  btn.click(); // Click the Increment button!
  const countElement = root?.getElementsByClassName('count')[0];
  const state = countElement && countElement.textContent ? parseInt(countElement.textContent, 10) : null;
  t.equal(state, 8, "State is 8 after increment.");
  // the "model" stored in localStorage should also be 8 now:
  const finalStoredValue = localStorage.getItem('todos-elmish_' + id);
  t.equal(finalStoredValue !== null ? JSON.parse(finalStoredValue) : null, { todos: [], count: 8 },
    "todos-elmish_store is { todos: [], count: 8 } (as expected).");
  if (root) elmish.empty(root); // reset the DOM to simulate refreshing a browser window
  elmish.mount({ todos: [], count: 5 }, update, view, id); // 5 ignored! read model from localStorage
  // clearing DOM does NOT clear the localStorage (this is desired behaviour!)
  const persistedValue = localStorage.getItem('todos-elmish_' + id);
  t.equal(persistedValue !== null ? JSON.parse(persistedValue) : null, { todos: [], count: 8 },
    "todos-elmish_store still { todos: [], count: 8 } from increment (above) saved in localStorage");
  localStorage.removeItem('todos-elmish_' + id);
  t.end()
});

test('elmish.add_attributes onclick=signal(action) events!', function (t) {
  const root = document.getElementById(id)!;
  elmish.empty(root);
  let counter = 0; // global to this test.
  function signal (action: string) { // simplified version of TEA "dispacher" function
    return function callback() {
      switch (action) {
        case 'inc':
          counter++; // "mutating" ("impure") counters for test simplicity.
          break;
      }
    }
  }

  root.appendChild(
    elmish.add_attributes(["id=btn", signal('inc')],
      document.createElement('button'))
  );

  // "click" the button!
  document.getElementById("btn")!.click()
  // confirm that the counter was incremented by the onclick being triggered:
  t.equal(counter, 1, "Counter incremented via onclick attribute (function)!");
  elmish.empty(root);
  t.end();
});


test('subscriptions test using counter-reset-keyaboard ⌨️', function (t) {
  const { view, update, subscriptions } = require('./counter-reset-keyboard.js') as { view: any, update: any, subscriptions: any };
  const root = document.getElementById(id)!;

  // mount the counter-reset-keyboard example app WITH subscriptions:
  elmish.mount({ todos: [], count: 0 }, update, view, id, subscriptions);

  // counter starts off at 0 (zero):
  const countElement = document.getElementById('count')!;
  t.equal(parseInt(countElement.textContent!, 10), 0, "Count is 0 (Zero) at start.");
  const storedValue = localStorage.getItem('todos-elmish_' + id)!;
  t.equal(JSON.parse(storedValue), 0,
    "todos-elmish_store is 0 (as expected). initial state saved to localStorage.");

  // trigger the [↑] (up) keyboard key to increment the counter:
  document.dispatchEvent(new KeyboardEvent('keyup', {'keyCode': 38})); // up
  const updatedCountElement = document.getElementById('count')!;
  t.equal(parseInt(updatedCountElement.textContent!, 10), 1, "Up key press increment 0 -> 1");
  const updatedStoredValue = localStorage.getItem('todos-elmish_' + id)!;
  t.equal(JSON.parse(updatedStoredValue), 1,
    "todos-elmish_store 1 (as expected). incremented state saved to localStorage.");

  // trigger the [↓] (down) keyboard key to increment the counter:
  document.dispatchEvent(new KeyboardEvent('keyup', {'keyCode': 40})); // down
  const decrementedCountElement = document.getElementById('count')!;
  t.equal(parseInt(decrementedCountElement.textContent!, 10), 0, "Up key press dencrement 1 -> 0");
  const decrementedStoredValue = localStorage.getItem('todos-elmish_' + id)!;
  t.equal(JSON.parse(decrementedStoredValue), 0,
    "todos-elmish_store 0. keyboard down key decrement state saved to localStorage.");

  // subscription keyCode trigger "branch" test (should NOT fire the signal):
  const clone = document.getElementById(id)!.cloneNode(true) as Node;
  document.dispatchEvent(new KeyboardEvent('keyup', {'keyCode': 42})); //
  t.deepEqual(document.getElementById(id), clone, "#" + id + " no change");

  // default branch execution:
  document.getElementById('inc')!.click();
  const incrementedCountElement = document.getElementById('count')!;
  t.equal(parseInt(incrementedCountElement.textContent!, 10), 1, "inc: 0 -> 1");
  document.getElementById('reset')!.click();
  const resetCountElement = document.getElementById('count')!;
  t.equal(parseInt(resetCountElement.textContent!, 10), 0, "reset: 1 -> 0");
  const no_change = update(null, 7);
  t.equal(no_change, 7, "no change in model if action is unrecognised.");

  localStorage.removeItem('todos-elmish_' + id);
  elmish.empty(root);
  t.end()
});
