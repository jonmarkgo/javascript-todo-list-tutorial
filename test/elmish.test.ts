import test from 'tape';
import fs from 'fs';
import path from 'path';
import * as elmish from '../lib/elmish';
import { TodoModel, TodoSignalFunction } from '../lib/types';

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'));

// Use a type assertion for jsdom-global
(require('jsdom-global') as Function)(html);

// Use a type assertion for jsdom
import jsdom from "jsdom";
const { JSDOM } = jsdom as any;
const id = 'test-app';

// Define types for HTML elements
type HTMLElementOrText = HTMLElement | Text;

// Test cases
test('elmish.append_childnodes append child DOM nodes to parent', function (t) {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  elmish.empty(root);
  const div = document.createElement('div');
  const p = document.createElement('p');
  const section = document.createElement('section');
  elmish.append_childnodes([div, p, section], root);
  t.equal(root.childElementCount, 3, "Root element " + id + " has 3 child els");
  t.end();
});

test('elmish create <header> view using HTML element functions', function (t) {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  elmish.append_childnodes([
    elmish.section(["class=todoapp"], [
      elmish.header(["class=header"], [
        elmish.h1([], [elmish.text("todos")]),
        elmish.input(["id=new", "class=new-todo", "placeholder=What needs to be done?", "autofocus"], [])
      ])
    ])
  ], root);

  const place = document.getElementById('new')?.getAttribute('placeholder');
  t.equal(place, "What needs to be done?", "placeholder set in <input> el");
  t.equal(document.querySelector('h1')?.textContent, 'todos', '<h1>todos</h1>');
  elmish.empty(root);
  t.end();
});

test('elmish create "main" view using HTML DOM functions', function (t) {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  elmish.append_childnodes([
    elmish.section(["class=main", "style=display: block;"], [
      elmish.input(["id=toggle-all", "class=toggle-all", "type=checkbox"], []),
      elmish.label(["for=toggle-all"], [elmish.text("Mark all as complete")]),
      elmish.ul(["class=todo-list"], [
        elmish.li(["data-id=123", "class=completed"], [
          elmish.div(["class=view"], [
            elmish.input(["class=toggle", "type=checkbox", "checked=true"], []),
            elmish.label([], [elmish.text('Learn The Elm Architecture ("TEA")')]),
            elmish.button(["class=destroy"], [])
          ])
        ]),
        elmish.li(["data-id=234"], [
          elmish.div(["class=view"], [
            elmish.input(["class=toggle", "type=checkbox"], []),
            elmish.label([], [elmish.text("Build TEA Todo List App")]),
            elmish.button(["class=destroy"], [])
          ])
        ])
      ])
    ])
  ], root);

  t.equal(document.querySelectorAll('li').length, 2, "2 <li> elements rendered");
  const label = document.querySelector('label[for=toggle-all]');
  t.equal(label?.textContent, "Mark all as complete", "<label> text rendered");
  elmish.empty(root);
  t.end();
});

// ... (keep other tests)

test('elmish.add_attributes does not add unrecognised attributes', function (t) {
  const div = document.createElement('div');
  div.id = 'divid';
  const clone = div.cloneNode(true) as HTMLElement;
  elmish.add_attributes(["unrecognised_attribute=noise"], div);
  t.deepEqual(div, clone, "<div> has not been altered");
  t.end();
});

test('elmish.add_attributes does not explode with empty attributes', function (t) {
  const div = document.createElement('div');
  div.id = 'divid';
  const clone = div.cloneNode(true) as HTMLElement;
  elmish.add_attributes([], div);
  t.deepEqual(div, clone, "<div> has not been altered");
  t.end();
});

// Last test case
test('elmish.empty removes all child nodes', function (t) {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  elmish.append_childnodes([elmish.div([], [elmish.text('test')])], root);
  t.equal(root.childNodes.length, 1, "Root element has 1 child node");
  elmish.empty(root);
  t.equal(root.childNodes.length, 0, "Root element has no child nodes");
  t.end();
});
