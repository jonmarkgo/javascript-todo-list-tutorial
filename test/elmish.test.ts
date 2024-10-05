import test from 'tape';
import * as fs from 'fs';
import * as path from 'path';
import * as elmish from '../lib/elmish';
import { JSDOM } from 'jsdom';

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
const dom = new JSDOM(html);
global.document = dom.window.document;
global.window = dom.window as unknown as Window & typeof globalThis;

const id = 'test-app';

// Create the test-app element
const testApp = document.createElement('div');
testApp.id = id;
document.body.appendChild(testApp);

test('elmish.empty("root") removes DOM elements from container', (t: test.Test) => {
  const text = 'Hello World!';
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

  const actualElement = document.getElementById(divid);
  if (!actualElement) {
    t.fail('Element not found');
    return t.end();
  }
  const actual = actualElement.textContent;
  t.equal(actual, text, "Contents of mydiv is: " + actual + ' == ' + text);
  t.equal(root.childElementCount, 1, "Root element " + id + " has 1 child el");

  elmish.empty(root);
  t.equal(root.childElementCount, 0, "After empty(root) has 0 child elements!");
  t.end();
});

test('elmish.add_attributes adds "autofocus" attribute', (t: test.Test) => {
  const { document } = (new JSDOM(`<!DOCTYPE html><div id="${id}"></div>`)).window;

  const rootElement = document.getElementById(id);
  if (!rootElement) {
    t.fail('Root element not found');
    return t.end();
  }
  rootElement.appendChild(
    elmish.add_attributes(["class=new-todo", "autofocus", "id=new"],
      document.createElement('input')
    )
  );
  t.end();
});

test('elmish.add_attributes applies HTML class attribute to el', (t: test.Test) => {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  const div = document.createElement('div');
  div.id = 'divid';
  const updatedDiv = elmish.add_attributes(["class=apptastic"], div);
  root.appendChild(updatedDiv);
  const nodes = document.getElementsByClassName('apptastic');
  t.equal(nodes.length, 1, "<div> has 'apptastic' CSS class applied");
  t.end();
});

test('elmish.add_attributes checked=true on "done" item', (t: test.Test) => {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  const input = document.createElement('input');
  const updatedInput = elmish.add_attributes(["type=checkbox", "checked=true"], input) as HTMLInputElement;
  root.appendChild(updatedInput);
  t.equal(updatedInput.checked, true, '<input type="checkbox" checked=true>');
  t.end();
});

test('elmish.add_attributes applies id HTML attribute to a node', (t: test.Test) => {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  let el = document.createElement('section');
  el = elmish.add_attributes(["id=myid"], el);
  const text = 'hello world!';
  var txt = document.createTextNode(text);
  el.appendChild(txt);
  root.appendChild(el);
  const actualElement = document.getElementById('myid');
  if (!actualElement) {
    t.fail('Element not found');
    return t.end();
  }
  const actual = actualElement.textContent;
  t.equal(actual, text, "<section> has 'myid' id attribute");
  elmish.empty(root);
  t.end();
});

test('elmish.add_attributes applies multiple attribute to node', (t: test.Test) => {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  elmish.empty(root);
  const el = document.createElement('span');
  const updatedEl = elmish.add_attributes(["id=myid", "class=totes mcawesome"], el);
  const text = 'hello world';
  var txt = document.createTextNode(text);
  updatedEl.appendChild(txt);
  root.appendChild(updatedEl);
  const actualElement = document.getElementById('myid');
  if (!actualElement) {
    t.fail('Element not found');
    return t.end();
  }
  const actual = actualElement.textContent;
  t.equal(actual, text, "<section> has 'myid' id attribute");
  t.equal(updatedEl.className, 'totes mcawesome', "CSS class applied");
  t.end();
});

test('elmish.add_attributes set placeholder on <input> element', (t: test.Test) => {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  const input = document.createElement('input');
  input.id = 'new-todo';
  const updatedInput = elmish.add_attributes(["placeholder=What needs to be done?"], input) as HTMLInputElement;
  root.appendChild(updatedInput);
  const inputElement = document.getElementById('new-todo') as HTMLInputElement;
  if (!inputElement) {
    t.fail('Input element not found');
    return t.end();
  }
  const placeholder = inputElement.getAttribute("placeholder");
  t.equal(placeholder, "What needs to be done?", "placeholder set on <input>");
  t.end();
});

test('elmish.add_attributes set data-id on <li> element', (t: test.Test) => {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  const li = document.createElement('li');
  li.id = 'task1';
  const updatedLi = elmish.add_attributes(["data-id=123"], li);
  root.appendChild(updatedLi);
  const liElement = document.getElementById('task1');
  if (!liElement) {
    t.fail('Li element not found');
    return t.end();
  }
  const data_id = liElement.getAttribute("data-id");
  t.equal(data_id, '123', "data-id successfully added to <li> element");
  t.end();
});

test('elmish.add_attributes set "for" attribute <label> element', (t: test.Test) => {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  const label = document.createElement('label');
  label.id = 'toggle';
  const updatedLabel = elmish.add_attributes(["for=toggle-all"], label);
  root.appendChild(updatedLabel);
  const labelElement = document.getElementById('toggle');
  if (!labelElement) {
    t.fail('Label element not found');
    return t.end();
  }
  const label_for = labelElement.getAttribute("for");
  t.equal(label_for, "toggle-all", '<label for="toggle-all">');
  t.end();
});

test('elmish.add_attributes type="checkbox" on <input> element', (t: test.Test) => {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  const input = document.createElement('input');
  const updatedInput = elmish.add_attributes(["type=checkbox", "id=toggle-all"], input) as HTMLInputElement;
  root.appendChild(updatedInput);
  const inputElement = document.getElementById('toggle-all') as HTMLInputElement;
  if (!inputElement) {
    t.fail('Input element not found');
    return t.end();
  }
  const type_attr = inputElement.getAttribute("type");
  t.equal(type_attr, "checkbox", '<input id="toggle-all" type="checkbox">');
  t.end();
});

test('elmish.add_attributes apply style="display: block;"', function (t) {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  elmish.empty(root);
  const sec = document.createElement('section');
  sec.id = 'main';
  const updatedSec = elmish.add_attributes(["style=display: block;"], sec);
  root.appendChild(updatedSec);
  const mainElement = document.getElementById('main');
  if (!mainElement) {
    t.fail('Main element not found');
    return t.end();
  }
  const style = mainElement.getAttribute("style");
  t.equal(style, "display: block;", '<section id="main" style="display: block;">');
  t.end();
});

test('elmish.text creates text node', function (t) {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  elmish.empty(root);
  const text = 'hello world';
  const textNode = elmish.text(text);
  root.appendChild(textNode);
  t.equal(root.textContent, text, "textNode contents is: " + text);
  t.end();
});

test('elmish.add_attributes checked=true on "done" item', function (t) {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  const input = document.createElement('input');
  const updatedInput = elmish.add_attributes(["type=checkbox", "checked=true"], input) as HTMLInputElement;
  root.appendChild(updatedInput);
  t.equal(updatedInput.checked, true, '<input type="checkbox" checked=true>');
  t.end();
});

// End of test suite
