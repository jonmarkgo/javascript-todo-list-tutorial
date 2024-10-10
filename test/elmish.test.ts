import test from 'tape';
import fs from 'fs';
import path from 'path';
import * as elmish from '../lib/elmish';
import { JSDOM } from 'jsdom';
import jsdomGlobal from 'jsdom-global';

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8');
jsdomGlobal(html);

const id = 'test-app';

// Type declaration for tape's Test object
interface Test {
  equal: (actual: any, expected: any, msg?: string) => void;
  deepEqual: (actual: any, expected: any, msg?: string) => void;
  end: () => void;
}

// Helper function to assert HTML element types
function assertHTMLElement<T extends HTMLElement>(element: HTMLElement | null): asserts element is T {
  if (!(element instanceof HTMLElement)) {
    throw new Error('Element is not an HTMLElement');
  }
}

test('elmish.empty("root") removes DOM elements from container', function (t: Test) {
  // setup the test div:
  const text = 'Hello World!'
  const root = document.getElementById(id);
  assertHTMLElement(root);
  const div = document.createElement('div');
  div.id = 'mydiv';
  div.textContent = text;
  root.appendChild(div);
  t.equal(root.childElementCount, 1, "Root element " + id + " has 1 child el");
  // empty the root element:
  elmish.empty(root);
  t.equal(root.childElementCount, 0, "Root element " + id + " has 0 child els");
  t.end();
});

test('elmish.mount app expect state to be Zero', function (t: Test) {
  // use view and update from counter-reset example
  // to confirm that our elmish.mount function is generic!
  const { view, update } = require('./counter.js');

  const root = document.getElementById(id);
  assertHTMLElement(root);
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

test('elmish.add_attributes adds "autofocus" attribute', function (t: Test) {
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

test('elmish.add_attributes applies HTML class attribute to el', function (t: Test) {
  const root = document.getElementById(id);
  assertHTMLElement(root);
  let div = document.createElement('div');
  div.id = 'divid';
  div = elmish.add_attributes(["class=apptastic"], div) as HTMLDivElement;
  root.appendChild(div);
  // test the div has the desired class:
  const nodes = document.getElementsByClassName('apptastic');
  t.equal(nodes.length, 1, "<div> has 'apptastic' CSS class applied");
  t.end();
});

test('elmish.add_attributes applies id HTML attribute to a node', function (t: Test) {
  const root = document.getElementById(id);
  assertHTMLElement(root);
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

test('elmish.add_attributes applies multiple attribute to node', function (t: Test) {
  const root = document.getElementById(id);
  assertHTMLElement(root);
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

test('elmish.add_attributes set placeholder on <input> element', function (t: Test) {
  const root = document.getElementById(id);
  assertHTMLElement(root);
  let input = document.createElement('input') as HTMLInputElement;
  input.id = 'new-todo';
  input = elmish.add_attributes(["placeholder=What needs to be done?"], input) as HTMLInputElement;
  root.appendChild(input);
  const placeholder = document.getElementById('new-todo')
    ?.getAttribute("placeholder");
  t.equal(placeholder, "What needs to be done?", "placeholder set on <input>");
  t.end();
});

test('elmish.add_attributes adds data-id to <li> element', function (t: Test) {
  const root = document.getElementById(id);
  assertHTMLElement(root);
  let li = document.createElement('li') as HTMLLIElement;
  li.id = 'task1';
  li = elmish.add_attributes(["data-id=123"], li) as HTMLLIElement;
  root.appendChild(li);
  const data_id = document.getElementById('task1')?.getAttribute("data-id");
  t.equal(data_id, '123', "data-id successfully added to <li> element");
  t.end();
});

test('elmish.add_attributes adds "for" attribute to <label> element', function (t: Test) {
  const root = document.getElementById(id);
  assertHTMLElement(root);
  let label = document.createElement('label') as HTMLLabelElement;
  label.id = 'toggle';
  label = elmish.add_attributes(["for=toggle-all"], label) as HTMLLabelElement;
  root.appendChild(label);
  const label_for = document.getElementById('toggle')?.getAttribute("for");
  t.equal(label_for, "toggle-all", '<label for="toggle-all">');
  t.end();
});

test('elmish.add_attributes type="checkbox" on <input> element', function (t: Test) {
  const root = document.getElementById(id);
  assertHTMLElement(root);
  let input = document.createElement('input') as HTMLInputElement;
  input = elmish.add_attributes(["type=checkbox", "id=toggle-all"], input) as HTMLInputElement;
  root.appendChild(input);
  const type_attr = document.getElementById('toggle-all')?.getAttribute("type");
  t.equal(type_attr, "checkbox", '<input id="toggle-all" type="checkbox">');
  const type_atrr = document.getElementById('toggle-all')?.getAttribute("type");
  t.equal(type_atrr, "checkbox", '<input id="toggle-all" type="checkbox">');
  t.end();
});

test('elmish.add_attributes apply style="display: block;"', function (t: Test) {
  const root = document.getElementById(id);
  assertHTMLElement(root);
  elmish.empty(root);
  let sec = document.createElement('section');
  root.appendChild(
    elmish.add_attributes(["id=main", "style=display: block;"], sec)
  );
  const style = window.getComputedStyle(document.getElementById('main') as HTMLElement);
  t.equal(style.display, 'block', 'style="display: block;" applied!')
  t.end();
});

test('elmish.add_attributes checked=true on "done" item', function (t: Test) {
  const root = document.getElementById(id);
  assertHTMLElement(root);
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

test('elmish.add_attributes <a href="#/active">Active</a>', function (t: Test) {
  const root = document.getElementById(id);
  assertHTMLElement(root);
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
test('test default branch of elmish.add_attributes (no effect)', function (t: Test) {
  const root = document.getElementById(id);
  assertHTMLElement(root);
  let div = document.createElement('div');
  div.id = 'divid';
  // "Clone" the div DOM node before invoking elmish.attributes to compare
  const clone = div.cloneNode(true);
  div = elmish.add_attributes(["unrecognised_attribute=noise"], div) as HTMLDivElement;
  t.deepEqual(div, clone, "<div> has not been altered");
  t.end();
});

/** null attrlist **/
test('test elmish.add_attributes attrlist null (no effect)', function (t: Test) {
  const root = document.getElementById(id);
  assertHTMLElement(root);
  let div = document.createElement('div');
  div.id = 'divid';
  // "Clone" the div DOM node before invoking elmish.attributes to compare
  const clone = div.cloneNode(true);
  div = elmish.add_attributes(null as any, div) as HTMLDivElement; // should not "explode"
  t.deepEqual(div, clone, "<div> has not been altered");
  t.end();
});

test('elmish.append_childnodes append child DOM nodes to parent', function (t: Test) {
  const root = document.getElementById(id);
  assertHTMLElement(root);
  elmish.empty(root); // clear the test DOM before!
  let div = document.createElement('div');
  let p = document.createElement('p');
  let section = document.createElement('section');
  elmish.append_childnodes([div, p, section], root);
  t.equal(root.childElementCount, 3, "Root element " + id + " has 3 child els");
  t.end();
});

test('elmish.section creates a <section> HTML element', function (t: Test) {
  const p = document.createElement('p');
  p.id = 'para';
  const text = 'Hello World!'
  const txt = document.createTextNode(text);
  p.appendChild(txt);
  // create the `<section>` HTML element using our section function
  const section = elmish.section(["class=new-todo"], [p])
  const root = document.getElementById(id);
  assertHTMLElement(root);
  root.appendChild(section); // add section with <p>
  // document.activeElement via: https://stackoverflow.com/a/17614883/1148249
  const para = document.getElementById('para');
  assertHTMLElement(para);
  t.equal(para.textContent, text,
    '<section> <p>' + text + '</p></section> works as expected!');
  elmish.empty(root);
  t.end();
});

test('elmish create <header> view using HTML element functions', function (t: Test) {
  const { append_childnodes, section, header, h1, text, input } = elmish;
  const root = document.getElementById(id);
  assertHTMLElement(root);
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
  ], root);

  const newInput = document.getElementById('new') as HTMLInputElement;
  const place = newInput.getAttribute('placeholder');
  t.equal(place, "What needs to be done?", "placeholder set in <input> el");
  const h1Element = document.querySelector('h1');
  assertHTMLElement(h1Element);
  t.equal(h1Element.textContent, 'todos', '<h1>todos</h1>');
  elmish.empty(root);
  t.end();
});

test('elmish create "main" view using HTML DOM functions', function (t: Test) {
  const { append_childnodes, section, input, label, ul, li, div, button, text } = elmish;
  const root = document.getElementById(id);
  assertHTMLElement(root);
  append_childnodes([
    section(["class=main", "style=display: block;"], [
      input(["id=toggle-all", "class=toggle-all", "type=checkbox"], []),
      label(["for=toggle-all"], [text("Mark all as complete")]),
      ul(["class=todo-list"], [
        li(["data-id=123", "class=completed"], [
          div(["class=view"], [
            input(["class=toggle", "type=checkbox", "checked=true"], []),
            label([], [text('Learn The Elm Architecture ("TEA")')]),
            button(["class=destroy"], [])
          ])
        ]),
        li(["data-id=234"], [
          div(["class=view"], [
            input(["class=toggle", "type=checkbox"], []),
            label([], [text("Build TEA Todo List App")]),
            button(["class=destroy"], [])
          ])
        ])
      ])
    ])
  ], root);

  const toggleAll = document.getElementById('toggle-all') as HTMLInputElement;
  t.equal(toggleAll.type, "checkbox", "toggle-all is a checkbox");
  const todoList = document.querySelector('.todo-list') as HTMLUListElement;
  t.equal(todoList.childElementCount, 2, "todo-list has two <li> elements");
  t.end();
});

// ... (any remaining test cases)
test('subscriptions test using counter-reset-keyaboard ⌨️', function (t: Test) {
  const { view, update, subscriptions } = require('./counter-reset-keyboard.js')
  const root = document.getElementById(id);
  assertHTMLElement(root);

  elmish.mount(0, update, view, id, subscriptions);

  // counter starts off at 0 (zero):
  const countElement = document.getElementById('count');
  assertHTMLElement(countElement);
  t.equal(parseInt(countElement.textContent || '0', 10), 0, "Count is 0 (Zero) at start.");
  t.equal(JSON.parse(localStorage.getItem('todos-elmish_' + id) || '0'), 0,
    "todos-elmish_store is 0 (as expected). initial state saved to localStorage.");

  // trigger the [↑] (up) keyboard key to increment the counter:
  document.dispatchEvent(new KeyboardEvent('keyup', {'keyCode': 38})); // up
  assertHTMLElement(countElement);
  t.equal(parseInt(countElement.textContent || '0', 10), 1, "Up key press increment 0 -> 1");
  t.equal(JSON.parse(localStorage.getItem('todos-elmish_' + id) || '0'), 1,
    "todos-elmish_store 1 (as expected). incremented state saved to localStorage.");

  // trigger the [↓] (down) keyboard key to increment the counter:
  document.dispatchEvent(new KeyboardEvent('keyup', {'keyCode': 40})); // down
  assertHTMLElement(countElement);
  t.equal(parseInt(countElement.textContent || '0', 10), 0, "Up key press decrement 1 -> 0");
  t.equal(JSON.parse(localStorage.getItem('todos-elmish_' + id) || '0'), 0,
    "todos-elmish_store 0. keyboard down key decrement state saved to localStorage.");

  // subscription keyCode trigger "branch" test (should NOT fire the signal):
  const clone = root.cloneNode(true);
  document.dispatchEvent(new KeyboardEvent('keyup', {'keyCode': 42})); //
  t.deepEqual(root, clone, "#" + id + " no change");

  // default branch execution:
  const incButton = document.getElementById('inc');
  assertHTMLElement(incButton);
  incButton.click();
  assertHTMLElement(countElement);
  t.equal(parseInt(countElement.textContent || '0', 10), 1, "inc: 0 -> 1");
  const resetButton = document.getElementById('reset');
  assertHTMLElement(resetButton);
  resetButton.click();
  assertHTMLElement(countElement);
  t.equal(parseInt(countElement.textContent || '0', 10), 0, "reset: 1 -> 0");
  const no_change = update(null, 7);
  t.equal(no_change, 7, "no change in model if action is unrecognised.");

  localStorage.removeItem('todos-elmish_' + id);
  elmish.empty(root);
  t.end();
});
