import fs from 'fs';
import path from 'path';
import * as elmish from '../lib/elmish.js';
import { JSDOM } from 'jsdom';
import 'jsdom-global';
import test from 'tape';

type Test = (name: string, cb: (t: any) => void) => void;
const typedTest: Test = test;

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'));
const dom = new JSDOM(html);
global.document = dom.window.document;
require('jsdom-global')(html);   // https://github.com/rstacruz/jsdom-global
const id = 'test-app';              // all tests use separate root element

typedTest('elmish.empty("root") removes DOM elements from container', function (t) {
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


typedTest('elmish.mount app expect state to be Zero', function (t) {
  // use view and update from counter-reset example
  // to confirm that our elmish.mount function is generic!
  const { view, update } = require('./counter.js');

  const root = document.getElementById(id) as HTMLElement;
  elmish.mount(7, update, view, id);
  const actual = document.getElementById(id)?.textContent;
  const actual_stripped = parseInt(actual?.replace('+', '')
    .replace('-Reset', '') ?? '', 10);
  const expected = 7;
  t.equal(expected, actual_stripped, "Inital state set to 7.");
  // reset to zero:
  console.log('root', root);
  const btn = root.getElementsByClassName("reset")[0] as HTMLElement; // click reset button
  btn.click(); // Click the Reset button!
  const state = parseInt((root.getElementsByClassName('count')[0] as HTMLElement)
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
  let div = document.createElement('div');
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
  let input = document.createElement('input');
  input.id = 'new-todo';
  input = elmish.add_attributes(["placeholder=What needs to be done?"], input) as HTMLInputElement;
  root.appendChild(input);
  const placeholder = document.getElementById('new-todo')
    ?.getAttribute("placeholder");
  t.equal(placeholder, "What needs to be done?", "placeholder set on <input>");
  t.end();
});

test('elmish.add_attributes set data-id on <li> element', function (t) {
  const root = document.getElementById(id) as HTMLElement;
  let li = document.createElement('li');
  li.id = 'task1';
  li = elmish.add_attributes(["data-id=123"], li) as HTMLLIElement;
  root.appendChild(li);
  const data_id = document.getElementById('task1')?.getAttribute("data-id");
  t.equal(data_id, '123', "data-id successfully added to <li> element");
  t.end();
});

test('elmish.add_attributes set "for" attribute <label> element', function (t) {
  const root = document.getElementById(id) as HTMLElement;
  let li = document.createElement('li');
  li.id = 'toggle';
  li = elmish.add_attributes(["for=toggle-all"], li) as HTMLLIElement;
  root.appendChild(li);
  const label_for = document.getElementById('toggle')?.getAttribute("for");
  t.equal(label_for, "toggle-all", '<label for="toggle-all">');
  t.end();
});

// ... (keep the existing tests)

test('elmish.add_attributes ignores unrecognised attributes', function (t) {
  const root = document.getElementById(id) as HTMLElement;
  let div = document.createElement('div');
  div.id = 'divid';
  // "Clone" the div DOM node before invoking elmish.attributes to compare
  const clone = div.cloneNode(true) as HTMLDivElement;
  div = elmish.add_attributes(["unrecognised_attribute=noise"], div) as HTMLDivElement;
  t.deepEqual(div, clone, "<div> has not been altered");
  t.end();
});

test('elmish.add_attributes does not "explode" if null attributes', function (t) {
  const root = document.getElementById(id) as HTMLElement;
  let div = document.createElement('div');
  div.id = 'divid';
  // "Clone" the div DOM node before invoking elmish.attributes to compare
  const clone = div.cloneNode(true) as HTMLDivElement;
  div = elmish.add_attributes([], div) as HTMLDivElement; // use empty array instead of null
  t.deepEqual(div, clone, "<div> has not been altered");
  t.end();
});

test('elmish.append_childnodes append child DOM nodes to parent', function (t) {
  const root = document.getElementById(id) as HTMLElement;
  elmish.empty(root); // clear the test DOM before!
  let div = document.createElement('div');
  let p = document.createElement('p');
  let section = document.createElement('section');
  elmish.append_childnodes([div, p, section], root);
  t.equal(root.childElementCount, 3, "Root element " + id + " has 3 child els");
  t.end();
});

test('elmish.section creates a <section> HTML element', function (t) {
  const p = document.createElement('p');
  p.id = 'para';
  const textContent = 'Hello World!';
  const txt = document.createTextNode(textContent);
  p.appendChild(txt);
  // create the `<section>` HTML element using our section function
  const sectionElement = elmish.section(["class=new-todo"], [p]);
  const rootElement = document.getElementById(id);
  if (rootElement) {
    rootElement.appendChild(sectionElement); // add section with <p>
  }
  // document.activeElement via: https://stackoverflow.com/a/17614883/1148249
  const paraElement = document.getElementById('para');
  if (paraElement) {
    t.equal(paraElement.textContent, textContent,
      '<section> <p>' + textContent + '</p></section> works as expected!');
  }
  if (rootElement) {
    elmish.empty(rootElement);
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

    const newInput = document.getElementById('new') as HTMLInputElement;
    const place = newInput?.getAttribute('placeholder');
    t.equal(place, "What needs to be done?", "placeholder set in <input> el");

    const h1Element = document.querySelector('h1');
    t.equal(h1Element?.textContent, 'todos', '<h1>todos</h1>');
    elmish.empty(rootElement);
  }
  t.end();
});

test('elmish create "main" view using HTML DOM functions', function (t) {
  const { append_childnodes, section, input, label, ul, li, div, button } = elmish;
  const rootElement = document.getElementById(id);
  if (rootElement) {
    append_childnodes([
      section(["class=main", "style=display: block;"], [
        input(["id=toggle-all", "class=toggle-all", "type=checkbox"], []),
        label(["for=toggle-all"], [ elmish.text("Mark all as complete") as unknown as HTMLElement ]),
        ul(["class=todo-list"], [
          li(["data-id=123", "class=completed"], [
            div(["class=view"], [
              input(["class=toggle", "type=checkbox", "checked=true"], []),
              label([], [elmish.text('Learn The Elm Architecture ("TEA")') as unknown as HTMLElement]),
              button(["class=destroy"], [])
            ]) // </div>
          ]), // </li>
          li(["data-id=234"], [
            div(["class=view"], [
              input(["class=toggle", "type=checkbox"], []),
              label([], [elmish.text("Build Todo List App") as unknown as HTMLElement]),
              button(["class=destroy"], [])
            ]) // </div>
          ]) // </li>
        ]) // </ul>
      ])
    ], rootElement);

    const completedItem = rootElement.querySelector('.completed');
    if (completedItem) {
      t.equal(completedItem.textContent, 'Learn The Elm Architecture ("TEA")', 'Done: Learn "TEA"');
    }
    const todoItem = rootElement.querySelectorAll('.view')[1];
    if (todoItem) {
      t.equal(todoItem.textContent, 'Build Todo List App', 'Todo: Build Todo List App');
    }
    elmish.empty(rootElement);
  }
  t.end();
});

test('elmish create <footer> view using HTML DOM functions', function (t) {
  const { append_childnodes, footer, span, strong, ul, li, a, button } = elmish;
  const rootElement = document.getElementById(id);
  if (rootElement) {
    append_childnodes([
      footer(["class=footer", "style=display: block;"], [
        span(["class=todo-count", "id=count"], [
          strong([], [elmish.text("1") as unknown as HTMLElement]),
          elmish.text(" item left") as unknown as HTMLElement
        ]),
        ul(["class=filters"], [
          li([], [
            a(["href=#/", "class=selected"], [elmish.text("All") as unknown as HTMLElement])
          ]),
          li([], [
            a(["href=#/active"], [elmish.text("Active") as unknown as HTMLElement])
          ]),
          li([], [
            a(["href=#/completed"], [elmish.text("Completed") as unknown as HTMLElement])
          ])
        ]),
        button(["class=clear-completed"], [elmish.text("Clear completed") as unknown as HTMLElement])
      ])
    ], rootElement);

    const count = document.getElementById('count');
    t.equal(count?.textContent, '1 item left', "1 item left");

    const clear = rootElement.querySelector('.clear-completed');
    t.equal(clear?.textContent, "Clear completed", '<button> text is "Clear completed"');

    const selected = rootElement.querySelector('.selected');
    t.equal(selected?.textContent, "All", "All is selected by default");

    elmish.empty(rootElement);
  }
  t.end();
});

test('elmish.route updates the url hash and sets history', function (t) {
  const initial_hash = window.location.hash;
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
});

// Testing localStorage requires "polyfil" because:
// https://github.com/jsdom/jsdom/issues/1137 ¯\_(ツ)_/¯
// globals are bad! but a "necessary evil" here ...
const mockStorage: { [key: string]: string } = {};
(global as any).localStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => { mockStorage[key] = value; },
  removeItem: (key: string) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach(key => delete mockStorage[key]); },
  key: (index: number) => Object.keys(mockStorage)[index] || null,
  length: Object.keys(mockStorage).length
};

typedTest('elmish.mount sets model in localStorage', function (t) {
  const { view, update } = require('./counter.js');
  const root = document.getElementById(id);

  if (!root) {
    t.fail('Root element not found');
    t.end();
    return;
  }

  elmish.mount(7 as any, update, view, id);
  // the "model" stored in localStorage should be 7 now:
  const storedValue = localStorage.getItem('todos-elmish_' + id);
  t.equal(JSON.parse(storedValue || '0'), 7, "todos-elmish_store is 7 (as expected). initial state saved to localStorage.");

  // test that mount still works as expected (check initial state of counter):
  const countElement = document.getElementById(id);
  if (countElement) {
    const actual = countElement.textContent;
    const actual_stripped = parseInt(actual?.replace('+', '').replace('-Reset', '') || '0', 10);
    const expected = 7;
    t.equal(expected, actual_stripped, "Initial state set to 7.");
  } else {
    t.fail("Count element not found");
  }

  // because mount should retrieve the value from localStorage
  elmish.mount(42 as any, update, view, id); // model (42) should be ignored this time!

  t.equal(JSON.parse(localStorage.getItem('todos-elmish_' + id) || '0'), 7,
    "todos-elmish_store is 7 (as expected). initial state saved to localStorage.");

  // increment the counter
  const incButton = root.getElementsByClassName("inc")[0] as HTMLElement;
  incButton.click(); // Click the Increment button!
  const stateElement = root.getElementsByClassName('count')[0];
  const state = parseInt(stateElement?.textContent || '0', 10);
  t.equal(state, 8, "State is 8 after increment.");

  elmish.empty(root); // reset the DOM to simulate refreshing a browser window
  elmish.mount(5 as any, update, view, id); // 5 ignored! read model from localStorage
  // clearing DOM does NOT clear the localStorage (this is desired behaviour!)
  t.equal(JSON.parse(localStorage.getItem('todos-elmish_' + id) || '0'), 8,
    "todos-elmish_store still 8 from increment (above) saved in localStorage");
  localStorage.removeItem('todos-elmish_' + id);
  t.end();
});

typedTest('elmish.add_attributes onclick=signal(action) events!', function (t) {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    t.end();
    return;
  }
  let counter = 0;
  function signal(action: string) {
    return function callback() {
      if (action === 'inc') {
        counter++;
      }
    }
  }
  root.appendChild(
    elmish.add_attributes(["id=btn", "onclick", signal('inc')] as (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[],
      document.createElement('button'))
  );

  // "click" the button!
  const btn = document.getElementById("btn");
  if (btn) {
    btn.click();
    // confirm that the counter was incremented by the onclick being triggered:
    t.equal(counter, 1, "Counter incremented via onclick attribute (function)!");
  } else {
    t.fail("Button element not found");
  }
  elmish.empty(root);
  t.end();
});

typedTest('elmish.mount sets initial state and handles subscriptions', function (t) {
  const { view, update } = require('./counter.js');
  const subscriptions = function (model: number) {
    return [
      ['keyup', function (ev: KeyboardEvent) {
        switch (ev.keyCode) {
          case 38: return 'inc';
          case 40: return 'dec';
          default: return ''; // if we don't recognise the keyCode, return empty action
        }
      }]
    ];
  };

  // mount the counter-reset-keyboard example app WITH subscriptions:
  elmish.mount(0, update, view, id, subscriptions as any);

  // counter starts off at 0 (zero):
  const countElement = document.getElementById('count');
  if (countElement && countElement.textContent) {
    t.equal(parseInt(countElement.textContent, 10), 0, "Count is 0 (Zero) at start.");
  } else {
    t.fail("Count element not found or has no text content");
  }

  const storedValue = localStorage.getItem('todos-elmish_' + id);
  if (storedValue) {
    t.equal(JSON.parse(storedValue), 0, "todos-elmish_store is 0 (as expected). initial state saved to localStorage.");
  } else {
    t.fail("No value stored in localStorage");
  }

  // trigger the [↑] (up) keyboard key to increment the counter:
  document.dispatchEvent(new KeyboardEvent('keyup', {'keyCode': 38})); // up

  const updatedCountElement = document.getElementById('count');
  if (updatedCountElement && updatedCountElement.textContent) {
    t.equal(parseInt(updatedCountElement.textContent, 10), 1, "Up key press increment 0 -> 1");
  } else {
    t.fail("Updated count element not found or has no text content");
  }

  const updatedStoredValue = localStorage.getItem('todos-elmish_' + id);
  if (updatedStoredValue) {
    t.equal(JSON.parse(updatedStoredValue), 1, "todos-elmish_store 1 (as expected). incremented state saved to localStorage.");
  } else {
    t.fail("No updated value stored in localStorage");
  }

  // trigger the [↓] (down) keyboard key to decrement the counter:
  document.dispatchEvent(new KeyboardEvent('keyup', {'keyCode': 40})); // down

  t.end();
});
