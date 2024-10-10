import test from 'tape';
import fs from 'fs';
import path from 'path';
import * as elmish from '../lib/elmish.js';
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'));
require('jsdom-global')(html);
import jsdom from "jsdom";
const { JSDOM } = jsdom;

const id = 'test-app';

// ... (keep existing tests with previous fixes)

test('elmish.append_childnodes append child DOM nodes to parent', function (t) {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  elmish.empty(root);
  let div = document.createElement('div');
  let p = document.createElement('p');
  let section = document.createElement('section');
  (elmish as any).append_childnodes([div, p, section], root);
  t.equal(root.childElementCount, 3, "Root element " + id + " has 3 child els");
  t.end();
});

test('elmish.section creates a <section> with a paragraph', function (t) {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  elmish.empty(root);
  const text = 'Hello World!';
  let p = document.createElement('p');
  p.id = 'para';
  let txt = document.createTextNode(text);
  p.appendChild(txt);
  const section = elmish.section(["class=new-todo"], [p]);
  root.appendChild(section);
  const paraElement = document.getElementById('para');
  t.equal(paraElement?.textContent, text,
    '<section> <p>' + text + '</p></section> works as expected!');
  elmish.empty(root);
  t.end();
});

test('elmish create <header> view using HTML element functions', function (t) {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  elmish.empty(root);
  const { section, header, h1, input } = elmish;
  (elmish as any).append_childnodes([
    section(["class=todoapp"], [
      header(["class=header"], [
        h1([], [
          document.createTextNode("todos") as unknown as HTMLElement
        ]),
        input([
          "id=new",
          "class=new-todo",
          "placeholder=What needs to be done?",
          "autofocus"
        ], [])
      ])
    ])
  ], root);

  const newInput = document.getElementById('new') as HTMLInputElement;
  const place = newInput?.getAttribute('placeholder');
  t.equal(place, "What needs to be done?", "placeholder set in <input> el");
  const h1Element = document.querySelector('h1');
  t.equal(h1Element?.textContent, 'todos', '<h1>todos</h1>');
  elmish.empty(root);
  t.end();
});

// ... (keep remaining tests with similar fixes)

// Update the last test to use an empty array instead of null
test('elmish.add_attributes does not alter element if attributes is empty', function (t) {
  let div = document.createElement('div');
  div.id = 'divid';
  const clone = div.cloneNode(true) as HTMLDivElement;
  div = elmish.add_attributes([], div) as HTMLDivElement;
  t.deepEqual(div, clone, "<div> has not been altered");
  t.end();
});
