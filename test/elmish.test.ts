import tape from 'tape';
import fs from 'fs';
import path from 'path';
import { emptyNode, mountApp, add_attributes, append_childnodes, section, header, h1, input, footer, span, strong, text, ul, li, a, button, div, label, route } from '../lib/elmish';
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'));
// Import of JSDOM removed as it's not needed if jsdom-global/register is used

const id = 'app'; // Define the id variable at the beginning of the file

tape('elmish.emptyNode("root") removes DOM elements from container', (t: tape.Test) => {
  // setup the test div:
  const text = 'Hello World!'
  const divid = "mydiv";
  // Ensure the root element exists
  const rootElement = document.createElement('div');
  rootElement.id = id;
  document.body.appendChild(rootElement);
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
  emptyNode(root); // exercise the `emptyNode` function!
  t.equal(root.childElementCount, 0, "After emptyNode(root) has 0 child elements!")
  t.end();
});


tape('elmish.mountApp app expect state to be Zero', (t: tape.Test) => {
  // use view and update from counter-reset example
  // to confirm that our elmish.mountApp function is generic!
  const { view, update } = require('./counter.js');

  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  const initial_model = { todos: [], hash: '#/' };
  mountApp(initial_model, update, view, id);
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
  emptyNode(root); // clean up after tests
  t.end()
});


tape('elmish.add_attributes adds "autofocus" attribute', (t: tape.Test) => {
  // Create a mock document
  document.body.innerHTML = `<div id="${id}"></div>`;

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

tape('elmish.add_attributes applies HTML class attribute to el', (t: tape.Test) => {
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

tape('elmish.add_attributes applies id HTML attribute to a node', (t: tape.Test) => {
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
  emptyNode(root); // clear the "DOM"/"state" before next test
  t.end();
});

tape('elmish.add_attributes applies multiple attribute to node', (t: tape.Test) => {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  emptyNode(root);
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

tape('elmish.add_attributes set placeholder on <input> element', (t: tape.Test) => {
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

tape('elmish.add_attributes set data-id on <li> element', (t: tape.Test) => {
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

tape('elmish.add_attributes set "for" attribute <label> element', (t: tape.Test) => {
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

tape('elmish.add_attributes type="checkbox" on <input> element', (t: tape.Test) => {
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

tape('elmish.add_attributes apply style="display: block;"', (t: tape.Test) => {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  emptyNode(root);
  let sec = document.createElement('section');
  root.appendChild(
    add_attributes(["id=main", "style=display: block;"], sec) as HTMLElement
  );
  const style = window.getComputedStyle(document.getElementById('main') as HTMLElement);
  t.equal(style.display, 'block', 'style="display: block;" applied!')
  t.end();
});

tape('elmish.add_attributes checked=true on "done" item', (t: tape.Test) => {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  emptyNode(root);
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

tape('elmish.add_attributes <a href="#/active">Active</a>', (t: tape.Test) => {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  emptyNode(root);
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
tape('test default branch of elmish.add_attributes (no effect)', (t: tape.Test) => {
  const root = document.getElementById(id);
  let div = document.createElement('div');
  div.id = 'divid';
  // "Clone" the div DOM node before invoking elmish.attributes to compare
  const clone = div.cloneNode(true);
  div = add_attributes(["unrecognised_attribute=noise"], div) as HTMLDivElement;
  t.deepEqual(div, clone as HTMLDivElement, "<div> has not been altered");
  t.end();
});

/** null attrlist **/
tape('test elmish.add_attributes attrlist null (no effect)', (t: tape.Test) => {
  const root = document.getElementById(id);
  let div = document.createElement('div');
  div.id = 'divid';
  // "Clone" the div DOM node before invoking elmish.attributes to compare
  const clone = div.cloneNode(true) as HTMLDivElement;
  div = add_attributes([] as string[], div) as HTMLDivElement; // should not "explode"
  t.deepEqual(div, clone, "<div> has not been altered");
  t.end();
});

tape('elmish.append_childnodes append child DOM nodes to parent', (t: tape.Test) => {
  const root = document.getElementById(id);
  if (root) {
    emptyNode(root); // clear the test DOM before!
    let div = document.createElement('div');
    let p = document.createElement('p');
    let section = document.createElement('section');
    append_childnodes([div, p, section], root);
    t.equal(root.childElementCount, 3, "Root element " + id + " has 3 child els");
  } else {
    t.fail('Root element not found');
  }
  t.end();
});

tape('elmish.section creates a <section> HTML element', (t: tape.Test) => {
  const p = document.createElement('p');
  p.id = 'para';
  const text = 'Hello World!'
  const txt = document.createTextNode(text);
  p.appendChild(txt);
  // create the `<section>` HTML element using our section function
  const sectionElement = section(["class=new-todo"], [p])
  const rootElement = document.getElementById(id);
  if (rootElement) {
    rootElement.appendChild(sectionElement); // add section with <p>
    // document.activeElement via: https://stackoverflow.com/a/17614883/1148249
    const paraElement = document.getElementById('para');
    if (paraElement) {
      t.equal(paraElement.textContent, text,
        '<section> <p>' + text + '</p></section> works as expected!');
    }
    emptyNode(rootElement);
  }
  t.end();
});

tape('elmish create <header> view using HTML element functions', (t: tape.Test) => {
  const rootElement = document.getElementById(id);
  if (rootElement) {
    append_childnodes([
      section(["class=todoapp"], [ // array of "child" elements
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
    ], rootElement);

    const newElement = document.getElementById('new') as HTMLInputElement;
    const place = newElement ? newElement.getAttribute('placeholder') : null;
    t.equal(place, "What needs to be done?", "placeholder set in <input> el");
    const h1Element = document.querySelector('h1');
    if (h1Element) {
      t.equal(h1Element.textContent, 'todos', '<h1>todos</h1>');
    }
    emptyNode(rootElement);
  }
  t.end();
});


tape('elmish create "main" view using HTML DOM functions', (t: tape.Test) => {
  const rootElement = document.getElementById(id);
  if (rootElement) {
    append_childnodes([
      section(["class=main", "style=display: block;"], [
        input(["id=toggle-all", "class=toggle-all", "type=checkbox"], []),
        label(["for=toggle-all"], [ text("Mark all as complete") ]),
        ul(["class=todo-list"], [
          li(["data-id=123", "class=completed"], [
            div(["class=view"], [
              input(["class=toggle", "type=checkbox", "checked=true"], []),
              label([], [text('Learn The Elm Architecture ("TEA")')]),
              button(["class=destroy"], [])
            ]) // </div>
          ]), // </li>
          li(["data-id=234"], [
            div(["class=view"], [
              input(["class=toggle", "type=checkbox"], []),
              label([], [text("Build TEA Todo List App")]),
              button(["class=destroy"], [])
            ]) // </div>
          ]) // </li>
        ]) // </ul>
      ])
    ], rootElement);
    const completedElement = document.querySelectorAll('.completed')[0];
    if (completedElement) {
      const done = completedElement.textContent;
      t.equal(done, 'Learn The Elm Architecture ("TEA")', 'Done: Learn "TEA"');
    }
    const viewElements = document.querySelectorAll('.view');
    if (viewElements.length > 1) {
      const todo = viewElements[1].textContent;
      t.equal(todo, 'Build TEA Todo List App', 'Todo: Build TEA Todo List App');
    }
    emptyNode(rootElement);
  }
  t.end();
});

tape('elmish create <footer> view using HTML DOM functions', (t: tape.Test) => {
  const rootElement = document.getElementById(id);
  if (rootElement) {
    append_childnodes([
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
        button(["class=clear-completed", "style=display:block;"],
          [text("Clear completed")]
        )
      ])
    ], rootElement);

    // count of items left:
    const countElement = document.getElementById('count');
    if (countElement) {
      const left = countElement.textContent;
      t.equal("1 item left", left, 'there is 1 (ONE) todo item left');
    }

    const buttonElements = document.querySelectorAll('button');
    if (buttonElements.length > 0) {
      const clear = buttonElements[0].textContent;
      t.equal(clear, "Clear completed", '<button> text is "Clear completed"');
    }
    const selectedElements = document.querySelectorAll('.selected');
    if (selectedElements.length > 0) {
      const selected = selectedElements[0].textContent;
      t.equal(selected, "All", "All is selected by default");
    }
    emptyNode(rootElement);
  }
  t.end();
});

tape('elmish.route updates the url hash and sets history', (t: tape.Test) => {
  const initial_hash = window.location.hash;
  console.log('START window.location.hash:', initial_hash, '(empty string)');
  const initial_history_length = window.history.length;
  console.log('START window.history.length:', initial_history_length);
  // update the URL Hash and Set Browser History
  const state = { hash: '' };
  const new_hash = '#/active';
  const updated_state = route(state, 'SET_HASH', new_hash);
  t.equal(updated_state.hash, new_hash, 'Hash in state is updated');
  t.equal(window.location.hash, new_hash, 'URL hash is updated');
  console.log('UPDATED window.history.length:', window.history.length);
  console.log('UPDATED state:', updated_state);
  console.log('UPDATED window.location.hash:', window.location.hash);
  t.notEqual(initial_hash, window.location.hash, "location.hash has changed!");
  t.equal(new_hash, updated_state.hash, "state.hash is now: " + updated_state.hash);
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
const mockLocalStorage: Storage = {
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
  clear: function(): void {
   Object.keys(this).forEach(key => delete this[key as keyof typeof this]);
  },
  length: 0,
  key: function(index: number): string | null {
   return Object.keys(this)[index] || null;
  }
};

(global as any).localStorage = global.localStorage || mockLocalStorage;

localStorage.removeItem('todos-elmish_' + id);
// localStorage.setItem('hello', 'world!');
// console.log('localStorage (polyfil) hello', localStorage.getItem('hello'));

// // Test mount's localStorage using view and update from counter-reset example
// // to confirm that our elmish.mount localStorage works and is "generic".
tape('elmish.mountApp sets model in localStorage', (t: tape.Test) => {
  const { view, update } = require('./counter.js');
  const root = document.getElementById(id);

  if (root) {
    mountApp({ todos: [], hash: '#/' }, update, view, id);
    // the "model" stored in localStorage should be 7 now:
    const storedValue = localStorage.getItem('todos-elmish_' + id);
    t.equal(JSON.parse(storedValue || '0'), 7,
      "todos-elmish_store is 7 (as expected). initial state saved to localStorage.");
    // test that mount still works as expected (check initial state of counter):
    const actual = root.textContent;
    if (actual) {
      const actual_stripped = parseInt(actual.replace('+', '')
        .replace('-Reset', ''), 10);
      const expected = 7;
      t.equal(expected, actual_stripped, "Inital state set to 7.");
    }
    // attempting to "re-mount" with a different model value should not work
    // because mount should retrieve the value from localStorage
    mountApp({ todos: [], hash: '#/' }, update, view, id); // model should be ignored this time!

    const storedValue2 = localStorage.getItem('todos-elmish_' + id);
    t.equal(JSON.parse(storedValue2 || '0'), 7,
      "todos-elmish_store is 7 (as expected). initial state saved to localStorage.");
    // increment the counter
    const btn = root.getElementsByClassName("inc")[0] as HTMLElement; // click increment button
    if (btn) {
      btn.click(); // Click the Increment button!
    }
    const countElement = root.getElementsByClassName('count')[0];
    if (countElement && countElement.textContent) {
      const state = parseInt(countElement.textContent, 10);
      t.equal(state, 8, "State is 8 after increment.");
    }
    // the "model" stored in localStorage should also be 8 now:
    const storedValue3 = localStorage.getItem('todos-elmish_' + id);
    t.equal(JSON.parse(storedValue3 || '0'), 8,
      "todos-elmish_store is 8 (as expected).");
    emptyNode(root); // reset the DOM to simulate refreshing a browser window
    mountApp({ todos: [], hash: '#/' }, update, view, id); // model should be ignored! read model from localStorage
    // clearing DOM does NOT clear the localStorage (this is desired behaviour!)
    const storedValue4 = localStorage.getItem('todos-elmish_' + id);
    t.equal(JSON.parse(storedValue4 || '0'), 8,
      "todos-elmish_store still 8 from increment (above) saved in localStorage");
  }
  localStorage.removeItem('todos-elmish_' + id);
  t.end();
});

tape('elmish.add_attributes onclick=signal(action) events!', (t: tape.Test) => {
  const root = document.getElementById(id);
  if (root) {
    emptyNode(root);
    let counter = 0; // global to this test.
    const signal = function (action: string) { // simplified version of TEA "dispacher" function
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
    const btnElement = document.getElementById("btn");
    if (btnElement) {
      btnElement.click();
    }
    // confirm that the counter was incremented by the onclick being triggered:
    t.equal(counter, 1, "Counter incremented via onclick attribute (function)!");
    emptyNode(root);
  }
  t.end();
});

tape('subscriptions test using counter-reset-keyaboard ⌨️', (t: tape.Test) => {
  const { view, update, subscriptions } = require('./counter-reset-keyboard.js');
  const root = document.getElementById(id);
  if (root) {
    // mount the counter-reset-keyboard example app WITH subscriptions:
    mountApp({ todos: [], hash: '#/' }, update, view, id, subscriptions);

    // counter starts off at 0 (zero):
    const countElement = document.getElementById('count');
    if (countElement && countElement.textContent) {
      t.equal(parseInt(countElement.textContent, 10), 0, "Count is 0 (Zero) at start.");
    }
    const storedValue = localStorage.getItem('todos-elmish_' + id);
    t.equal(JSON.parse(storedValue || '0'), 0,
      "todos-elmish_store is 0 (as expected). initial state saved to localStorage.");

    // trigger the [↑] (up) keyboard key to increment the counter:
    document.dispatchEvent(new KeyboardEvent('keyup', {'keyCode': 38})); // up
    const countElement2 = document.getElementById('count');
    if (countElement2 && countElement2.textContent) {
      t.equal(parseInt(countElement2.textContent, 10), 1, "Up key press increment 0 -> 1");
    }
    const storedValue2 = localStorage.getItem('todos-elmish_' + id);
    t.equal(JSON.parse(storedValue2 || '0'), 1,
      "todos-elmish_store 1 (as expected). incremented state saved to localStorage.");

    // trigger the [↓] (down) keyboard key to increment the counter:
    document.dispatchEvent(new KeyboardEvent('keyup', {'keyCode': 40})); // down
    const countElement3 = document.getElementById('count');
    if (countElement3 && countElement3.textContent) {
      t.equal(parseInt(countElement3.textContent, 10), 0, "Up key press dencrement 1 -> 0");
    }
    const storedValue3 = localStorage.getItem('todos-elmish_' + id);
    t.equal(JSON.parse(storedValue3 || '0'), 0,
      "todos-elmish_store 0. keyboard down key decrement state saved to localStorage.");

    // subscription keyCode trigger "branch" test (should NOT fire the signal):
    const clone = root.cloneNode(true);
    document.dispatchEvent(new KeyboardEvent('keyup', {'keyCode': 42})); //
    t.deepEqual(root, clone, "#" + id + " no change");

    // default branch execution:
    const incElement = document.getElementById('inc');
    if (incElement) {
      incElement.click();
    }
    const countElement4 = document.getElementById('count');
    if (countElement4 && countElement4.textContent) {
      t.equal(parseInt(countElement4.textContent, 10), 1, "inc: 0 -> 1");
    }
    const resetElement = document.getElementById('reset');
    if (resetElement) {
      resetElement.click();
    }
    const countElement5 = document.getElementById('count');
    if (countElement5 && countElement5.textContent) {
      t.equal(parseInt(countElement5.textContent, 10), 0, "reset: 1 -> 0");
    }
    const no_change = update(null, 7);
    t.equal(no_change, 7, "no change in model if action is unrecognised.");

    localStorage.removeItem('todos-elmish_' + id);
    emptyNode(root);
  }
  t.end();
});
