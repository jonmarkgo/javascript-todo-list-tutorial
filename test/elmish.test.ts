import test from 'tape';       // https://github.com/dwyl/learn-tape
import fs from 'fs';           // read html files (see below)
import path from 'path';       // so we can open files cross-platform
import * as elmish from '../lib/elmish';
import { add_attributes } from '../lib/elmish';
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'));
require('jsdom-global')(html);   // https://github.com/rstacruz/jsdom-global
import jsdom from "jsdom";
const { JSDOM } = jsdom;

const id = 'app'; // Define the id variable at the beginning of the file

test('elmish.emptyNode("root") removes DOM elements from container', function (t) {
  // setup the test div:
  const text = 'Hello World!'
  const divid = "mydiv";
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
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
  elmish.emptyNode(root); // exercise the `emptyNode` function!
  t.equal(root.childElementCount, 0, "After emptyNode(root) has 0 child elements!")
  t.end();
});


test('elmish.mountApp app expect state to be Zero', function (t) {
  // use view and update from counter-reset example
  // to confirm that our elmish.mountApp function is generic!
  const { view, update } = require('./counter.js') as {
    view: (model: number, signal: (action: string) => void) => HTMLElement,
    update: (action: string, model: number) => number
  };

  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  const initial_model = { todos: [], hash: '#/' };
  elmish.mountApp(initial_model, update as any, view as any, id);
  const actual = document.getElementById(id)?.textContent;
  const actual_stripped = parseInt(actual?.replace('+', '')
    .replace('-Reset', '') ?? '', 10);
  const expected = 7;
  t.equal(expected, actual_stripped, "Inital state set to 7.");
  // reset to zero:
  console.log('root', root);
  const btn = root.getElementsByClassName("reset")[0] as HTMLElement; // click reset button
  if (!btn) {
    t.fail('Reset button not found');
    return t.end();
  }
  btn.click(); // Click the Reset button!
  const countElement = root.getElementsByClassName('count')[0] as HTMLElement;
  if (!countElement) {
    t.fail('Count element not found');
    return t.end();
  }
  const state = parseInt(countElement.textContent ?? '', 10);
  t.equal(state, 0, "State is 0 (Zero) after reset."); // state reset to 0!
  elmish.emptyNode(root); // clean up after tests
  t.end()
});


test('elmish.add_attributes adds "autofocus" attribute', function (t) {
  const { document } = (new JSDOM(`<!DOCTYPE html><div id="${id}"></div>`)).window;

  document.getElementById(id)?.appendChild(
    add_attributes(["class=new-todo", "autofocus", "id=new"],
      document.createElement('input')
    ) as HTMLElement
  );
  // document.activeElement via: https://stackoverflow.com/a/17614883/1148249
  // t.deepEqual(document.getElementById('new'), document.activeElement,
  //   '<input autofocus> is in "focus"');

  // This assertion is commented because of a broking change in JSDOM see:
  // https://github.com/dwyl/javascript-todo-list-tutorial/issues/29

  t.end();
});

test('elmish.add_attributes applies HTML class attribute to el', function (t) {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  let div = document.createElement('div');
  div.id = 'divid';
  div = add_attributes(["class=apptastic"], div) as HTMLDivElement;
  root.appendChild(div);
  // test the div has the desired class:
  const nodes = document.getElementsByClassName('apptastic');
  t.equal(nodes.length, 1, "<div> has 'apptastic' CSS class applied");
  t.end();
});

test('elmish.add_attributes applies id HTML attribute to a node', function (t) {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  let el = document.createElement('section');
  el = add_attributes(["id=myid"], el) as HTMLElement;
  const text = 'hello world!'
  var txt = document.createTextNode(text);
  el.appendChild(txt);
  root.appendChild(el);
  const actual = document.getElementById('myid')?.textContent;
  t.equal(actual, text, "<section> has 'myid' id attribute");
  elmish.emptyNode(root); // clear the "DOM"/"state" before next test
  t.end();
});

test('elmish.add_attributes applies multiple attribute to node', function (t) {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  elmish.emptyNode(root);
  let el = document.createElement('span');
  el = add_attributes(["id=myid", "class=totes mcawesome"], el) as HTMLSpanElement;
  const text = 'hello world'
  var txt = document.createTextNode(text);
  el.appendChild(txt);
  root.appendChild(el);
  const actual = document.getElementById('myid')?.textContent;
  t.equal(actual, text, "<section> has 'myid' id attribute");
  t.equal(el.className, 'totes mcawesome', "CSS class applied");
  t.end();
});

test('elmish.add_attributes set placeholder on <input> element', function (t) {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  let input = document.createElement('input');
  input.id = 'new-todo';
  input = add_attributes(["placeholder=What needs to be done?"], input) as HTMLInputElement;
  root.appendChild(input);
  const placeholder = document.getElementById('new-todo')
    ?.getAttribute("placeholder");
  t.equal(placeholder, "What needs to be done?", "paceholder set on <input>");
  t.end();
});

test('elmish.add_attributes set data-id on <li> element', function (t) {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  let li = document.createElement('li');
  li.id = 'task1';
  li = add_attributes(["data-id=123"], li) as HTMLLIElement;
  root.appendChild(li);
  const data_id = document.getElementById('task1')?.getAttribute("data-id");
  t.equal(data_id, '123', "data-id successfully added to <li> element");
  t.end();
});

test('elmish.add_attributes set "for" attribute <label> element', function (t) {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  let label = document.createElement('label');
  label.id = 'toggle';
  label = add_attributes(["for=toggle-all"], label) as HTMLLabelElement;
  root.appendChild(label);
  const label_for = document.getElementById('toggle')?.getAttribute("for");
  t.equal(label_for, "toggle-all", '<label for="toggle-all">');
  t.end();
});

test('elmish.add_attributes type="checkbox" on <input> element', function (t) {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  let input = document.createElement('input');
  input = add_attributes(["type=checkbox", "id=toggle-all"], input) as HTMLInputElement;
  root.appendChild(input);
  const type_atrr = document.getElementById('toggle-all')?.getAttribute("type");
  t.equal(type_atrr, "checkbox", '<input id="toggle-all" type="checkbox">');
  t.end();
});

test('elmish.add_attributes apply style="display: block;"', function (t) {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  elmish.emptyNode(root);
  let sec = document.createElement('section');
  root.appendChild(
    add_attributes(["id=main", "style=display: block;"], sec) as HTMLElement
  );
  const style = window.getComputedStyle(document.getElementById('main') as HTMLElement);
  t.equal(style.display, 'block', 'style="display: block;" applied!')
  t.end();
});

test('elmish.add_attributes checked=true on "done" item', function (t) {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  elmish.emptyNode(root);
  let input = document.createElement('input');
  input = add_attributes(["type=checkbox", "id=item1", "checked=true"],
    input) as HTMLInputElement;
  root.appendChild(input);
  const item1 = document.getElementById('item1');
  if (item1 instanceof HTMLInputElement) {
    t.equal(item1.checked, true, '<input type="checkbox" checked="checked">');
  } else {
    t.fail('Item1 element not found or not an input');
  }
  // test "checked=false" so we know we are able to "toggle" a todo item:
  root.appendChild(
    add_attributes(
      ["type=checkbox", "id=item2"],
      document.createElement('input')
    )
  );
  const item2 = document.getElementById('item2');
  if (item2 instanceof HTMLInputElement) {
    t.equal(item2.checked, false, 'checked=false');
  } else {
    t.fail('Item2 element not found or not an input');
  }
  t.end();
});

test('elmish.add_attributes <a href="#/active">Active</a>', function (t) {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  elmish.emptyNode(root);
  root.appendChild(
    add_attributes(["href=#/active", "class=selected", "id=active"],
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
  let div = document.createElement('div');
  div.id = 'divid';
  // "Clone" the div DOM node before invoking elmish.attributes to compare
  const clone = div.cloneNode(true);
  div = elmish.add_attributes(["unrecognised_attribute=noise"], div) as HTMLDivElement;
  t.deepEqual(div, clone as HTMLDivElement, "<div> has not been altered");
  t.end();
});

/** null attrlist **/
test('test elmish.add_attributes attrlist null (no effect)', function (t) {
  const root = document.getElementById(id);
  let div = document.createElement('div');
  div.id = 'divid';
  // "Clone" the div DOM node before invoking elmish.attributes to compare
  const clone = div.cloneNode(true) as HTMLDivElement;
  div = elmish.add_attributes([] as string[], div) as HTMLDivElement; // should not "explode"
  t.deepEqual(div, clone, "<div> has not been altered");
  t.end();
});

test('elmish.append_childnodes append child DOM nodes to parent', function (t) {
  const root = document.getElementById(id);
  if (root) {
    elmish.emptyNode(root); // clear the test DOM before!
    let div = document.createElement('div');
    let p = document.createElement('p');
    let section = document.createElement('section');
    elmish.append_childnodes([div, p, section], root);
    t.equal(root.childElementCount, 3, "Root element " + id + " has 3 child els");
  } else {
    t.fail('Root element not found');
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
  } else {
    t.fail('Root element not found');
    return t.end();
  }
  // document.activeElement via: https://stackoverflow.com/a/17614883/1148249
  const paraElement = document.getElementById('para');
  if (paraElement) {
    t.equal((paraElement as HTMLElement).textContent, text,
      '<section> <p>' + text + '</p></section> works as expected!');
  } else {
    t.fail('Paragraph element not found');
  }
  // Removed duplicate declaration of rootElement
  if (rootElement) {
    elmish.emptyNode(rootElement);
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

    const newInput = document.getElementById('new');
    const place = newInput ? newInput.getAttribute('placeholder') : null;
    t.equal(place, "What needs to be done?", "placeholder set in <input> el");

    const h1Element = document.querySelector('h1');
    t.equal(h1Element?.textContent, 'todos', '<h1>todos</h1>');

    elmish.emptyNode(rootElement);
  } else {
    t.fail('Root element not found');
  }
  t.end();
});

test('elmish create <section> view using HTML element functions', function (t) {
  const { append_childnodes, section, input, label, ul, li, div, button, text } = elmish;
  const rootElement = document.getElementById(id);
  if (rootElement) {
    append_childnodes([
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
        ]) // </ul>
      ]) // </section>
    ], rootElement);
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

  const rootElement = document.getElementById(id);
  if (rootElement) {
    // Define mock view and update functions for testing purposes
    const mockView = (model: any, signal: any) => document.createElement('div');
    const mockUpdate = (action: any, model: any) => model;

    const initial_model = { todos: [], hash: '#/' };
    elmish.mountApp(initial_model, mockUpdate, mockView, id);
    const done = document.querySelectorAll('.completed')[0]?.textContent;
    t.equal(done, 'Learn The Elm Architecture ("TEA")', 'Done: Learn "TEA"');
    const todo = document.querySelectorAll('.view')[1]?.textContent;
    t.equal(todo, 'Build TEA Todo List App', 'Todo: Build TEA Todo List App');
    elmish.emptyNode(rootElement);
  }
  t.end();
});

test('elmish create <footer> view using HTML DOM functions', function (t) {
  const { footer, span, strong, text } = elmish;
  const ul = (attrs: string[], children: HTMLElement[]): HTMLElement => {
    const element = document.createElement('ul');
    elmish.add_attributes(attrs, element);
    children.forEach(child => element.appendChild(child));
    return element;
  };
  const li = (attrs: string[], children: (HTMLElement | Text)[]): HTMLElement => {
    const element = document.createElement('li');
    elmish.add_attributes(attrs, element);
    children.forEach(child => element.appendChild(child));
    return element;
  };
  const a = (attrs: string[], children: (HTMLElement | Text)[]): HTMLElement => {
    const element = document.createElement('a');
    elmish.add_attributes(attrs, element);
    children.forEach(child => element.appendChild(child));
    return element;
  };
  const createTextElement = (content: string): HTMLElement => {
    const span = document.createElement('span');
    span.textContent = content;
    return span;
  };
  const rootElement = document.getElementById(id);
  if (rootElement) {
    elmish.append_childnodes([
      footer(["class=footer", "style=display: block;"], [
        span(["class=todo-count", "id=count"], [
          strong("1"),
          createTextElement(" item left")
        ]),
        ul(["class=filters"], [
          li([], [
            a(["href=#/", "class=selected"], [createTextElement("All")])
          ]),
          li([], [
            a(["href=#/active"], [createTextElement("Active")])
          ]),
          li([], [
            a(["href=#/completed"], [createTextElement("Completed")])
          ])
        ]),
        elmish.button(
          ["class=clear-completed", "style=display:block;"],
          [createTextElement("Clear completed")]
        )
      ])
    ], rootElement);

    // count of items left:
    const left = document.getElementById('count')?.textContent;
    t.equal("1 item left", left, 'there is 1 (ONE) todo item left');

    const clear = document.querySelectorAll('button')[0]?.textContent;
    t.equal(clear, "Clear completed", '<button> text is "Clear completed"');
    const selected = document.querySelectorAll('.selected')[0]?.textContent;
    t.equal(selected, "All", "All is selected by default");
    elmish.emptyNode(rootElement);
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
  const new_hash = '#/active';
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
// Testing localStorage requires "polyfil" because:
// https://github.com/jsdom/jsdom/issues/1137 ¯\_(ツ)_/¯
// globals are bad! but a "necessary evil" here ...
if (!global.localStorage) {
  global.localStorage = {
    getItem: function(key: string): string | null {
      const value = this[key as keyof typeof this];
      return typeof value === 'undefined' ? null : value as string;
    },
    setItem: function (key: string, value: string): void {
      (this as Record<string, string>)[key] = value;
    },
    removeItem: function (key: string): void {
      delete (this as Record<string, string>)[key];
    }
  } as Storage;
}

localStorage.removeItem('todos-elmish_' + id);

localStorage.removeItem('todos-elmish_' + id);
// localStorage.setItem('hello', 'world!');
// console.log('localStorage (polyfil) hello', localStorage.getItem('hello'));

// // Test mount's localStorage using view and update from counter-reset example
// // to confirm that our elmish.mount localStorage works and is "generic".
test('elmish.mountApp sets model in localStorage', function (t) {
  const { view, update } = require('./counter.js');
  const root = document.getElementById(id);

  const initial_model = { todos: [], hash: '#/' };
  elmish.mountApp(initial_model, update, view, id);
  // the "model" stored in localStorage should be 7 now:
  const storedValue = localStorage.getItem('todos-elmish_' + id);
  t.deepEqual(JSON.parse(storedValue || '{}'), initial_model,
    "todos-elmish_store is initial_model (as expected). initial state saved to localStorage.");
  // test that mount still works as expected (check initial state of counter):
  const element = document.getElementById(id);
  const actual = element ? element.textContent : '';
  const actual_stripped = actual ? parseInt(actual.replace('+', '')
    .replace('-Reset', ''), 10) : 0;
  const expected = 0;
  t.equal(expected, actual_stripped, "Initial state set to 0.");
  // attempting to "re-mount" with a different model value should not work
  // because mount should retrieve the value from localStorage
  const different_model = { todos: [{ id: 1, title: 'Test', done: false }], hash: '#/active' };
  elmish.mountApp(different_model, update, view, id); // model should be ignored this time!

  const storedValue2 = localStorage.getItem('todos-elmish_' + id);
  t.deepEqual(JSON.parse(storedValue2 || '{}'), initial_model,
    "todos-elmish_store is still initial_model (as expected). initial state saved to localStorage.");
  // increment the counter
  const btn = root?.getElementsByClassName("inc")[0] as HTMLElement; // click increment button
  if (btn) {
    btn.click(); // Click the Increment button!
  }
  const countElement = root?.getElementsByClassName('count')[0];
  const state = countElement ? parseInt(countElement.textContent || '0', 10) : 0;
  t.equal(state, 1, "State is 1 after increment.");
  // the "model" stored in localStorage should also be updated now:
  const storedValue3 = localStorage.getItem('todos-elmish_' + id);
  const updatedModel = JSON.parse(storedValue3 || '{}');
  t.equal(updatedModel.todos.length, 1, "todos-elmish_store has 1 todo item (as expected).");
  if (root) {
    elmish.emptyNode(root); // reset the DOM to simulate refreshing a browser window
  }
  elmish.mountApp(different_model, update, view, id); // different_model ignored! read model from localStorage
  // clearing DOM does NOT clear the localStorage (this is desired behaviour!)
  const storedValue4 = localStorage.getItem('todos-elmish_' + id);
  t.deepEqual(JSON.parse(storedValue4 || '{}'), updatedModel,
    "todos-elmish_store still has the updated model from increment (above) saved in localStorage");
  localStorage.removeItem('todos-elmish_' + id);
  t.end();
});

test('elmish.add_attributes onclick=signal(action) events!', function (t) {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  elmish.emptyNode(root);
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
    add_attributes(["id=btn", signal('inc')],
      document.createElement('button'))
  );

  // "click" the button!
  const btn = document.getElementById("btn");
  if (btn instanceof HTMLElement) {
    btn.click();
    // confirm that the counter was incremented by the onclick being triggered:
    t.equal(counter, 1, "Counter incremented via onclick attribute (function)!");
  } else {
    t.fail("Button element not found");
  }
  elmish.emptyNode(root);
  t.end();
});


test('subscriptions test using counter-reset-keyaboard ⌨️', function (t) {
  const { view, update, subscriptions } = require('./counter-reset-keyboard.js') as {
    view: (model: number, signal: (action: string) => void) => HTMLElement,
    update: (action: string | null, model: number) => number,
    subscriptions: (signal: (action: string) => void) => void
  };
  const root = document.getElementById(id);
  if (!root) {
    t.fail("Root element not found");
    return t.end();
  }

  // mount the counter-reset-keyboard example app WITH subscriptions:
  const initial_model = { todos: [], hash: '#/' };
  elmish.mountApp(initial_model, update as any, view as any, id, subscriptions);

  // counter starts off at 0 (zero):
  const countElement = document.getElementById('count');
  t.equal(countElement?.textContent, '0', "counter starts at 0");

  // simulate keypress event:
  const event = new KeyboardEvent('keyup', { 'key': 'ArrowUp' });
  document.dispatchEvent(event);

  // counter should now be 1:
  t.equal(countElement?.textContent, '1',
    "counter incremented to 1 after ArrowUp keypress");

  // cleanup
  elmish.emptyNode(root);
  t.end();
});

test('counter functionality test', function (t) {
  // counter starts off at 0 (zero):
  const countElement = document.getElementById('count');
  if (countElement) {
    t.equal(parseInt(countElement.textContent || '0', 10), 0, "Count is 0 (Zero) at start.");
  }
  const storedValue = localStorage.getItem('todos-elmish_' + id);
  t.equal(JSON.parse(storedValue || '0'), 0,
    "todos-elmish_store is 0 (as expected). initial state saved to localStorage.");

  // trigger the [↑] (up) keyboard key to increment the counter:
  document.dispatchEvent(new KeyboardEvent('keyup', {'keyCode': 38})); // up
  const countElementUp = document.getElementById('count');
  if (countElementUp) {
    t.equal(parseInt(countElementUp.textContent || '0', 10), 1, "Up key press increment 0 -> 1");
  }
  const storedValueUp = localStorage.getItem('todos-elmish_' + id);
  t.equal(JSON.parse(storedValueUp || '0'), 1,
    "todos-elmish_store 1 (as expected). incremented state saved to localStorage.");

  // trigger the [↓] (down) keyboard key to increment the counter:
  document.dispatchEvent(new KeyboardEvent('keyup', {'keyCode': 40})); // down
  const countElementDown = document.getElementById('count');
  if (countElementDown) {
    t.equal(parseInt(countElementDown.textContent || '0', 10), 0, "Up key press decrement 1 -> 0");
  }
  const storedValueDown = localStorage.getItem('todos-elmish_' + id);
  t.equal(JSON.parse(storedValueDown || '0'), 0,
    "todos-elmish_store 0. keyboard down key decrement state saved to localStorage.");

  // subscription keyCode trigger "branch" test (should NOT fire the signal):
  const testRootElement = document.getElementById(id);
  if (testRootElement) {
    const clone = testRootElement.cloneNode(true);
    document.dispatchEvent(new KeyboardEvent('keyup', {'keyCode': 42})); //
    t.deepEqual(document.getElementById(id), clone, "#" + id + " no change");
  }

  // default branch execution:
  const incButton = document.getElementById('inc');
  if (incButton instanceof HTMLElement) {
    incButton.click();
    const countElementInc = document.getElementById('count');
    if (countElementInc) {
      t.equal(parseInt(countElementInc.textContent || '0', 10), 1, "inc: 0 -> 1");
    }
  }
  const resetButton = document.getElementById('reset');
  if (resetButton instanceof HTMLElement) {
    resetButton.click();
    const countElementReset = document.getElementById('count');
    if (countElementReset) {
      t.equal(parseInt(countElementReset.textContent || '0', 10), 0, "reset: 1 -> 0");
    }
  }

  t.end();
});
