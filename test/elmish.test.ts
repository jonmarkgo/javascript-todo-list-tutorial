import test from 'tape';
import * as fs from 'fs';
import * as path from 'path';
import * as elmish from '../lib/elmish';

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8');
require('jsdom-global')(html);
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

// Mock localStorage
const mockLocalStorage = (function() {
  let store: { [key: string]: string } = {};
  return {
    getItem: function(key: string) {
      return store[key] || null;
    },
    setItem: function(key: string, value: string) {
      store[key] = value.toString();
    },
    clear: function() {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Helper function to get the test app element
function getTestAppElement(): HTMLElement | null {
  return document.getElementById('test-app');
}

test('elmish.empty() removes all child elements from a parent node', (t: test.Test) => {
  const root = getTestAppElement();
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  elmish.empty(root);
  elmish.append_childnodes([
    elmish.create_element('section', ['class=todoapp'], [
      elmish.create_element('header', ['class=header'], [
        elmish.create_element('h1', [], [
          elmish.text('todos')
        ]),
        elmish.create_element('input', ['id=new-todo', 'class=new-todo', 'placeholder=What needs to be done?', 'autofocus'], [])
      ])
    ])
  ], [root]);
  const h1_text = document.querySelector('h1')?.textContent;
  t.equal(h1_text, "todos", "<h1>todos</h1> text node created.");
  const input_el = document.getElementById('new-todo') as HTMLInputElement;
  t.equal(input_el.className, "new-todo", "<input> element has correct class");
  t.equal(input_el.placeholder, "What needs to be done?", "<input> placeholder");
  t.end();
});

test('elmish.route() updates window.location.hash', (t: test.Test) => {
  const initial_hash = window.location.hash;
  const initial_history_length = window.history.length;
  console.log('START window.history.length:', initial_history_length);
  const new_hash = '#/active';
  elmish.route(new_hash);
  console.log('UPDATED window.history.length:', window.history.length);
  console.log('UPDATED window.location.hash:', window.location.hash);
  t.notEqual(initial_hash, window.location.hash, "location.hash has changed!");
  t.equal(new_hash, window.location.hash, `window.location.hash: ${window.location.hash}`);
  t.equal(initial_history_length + 1, window.history.length,
    `window.history.length increased from: ${initial_history_length} to: ${window.history.length}`);
  t.end();
});

test('elmish.add_attributes onclick=signal(action) events!', (t: test.Test) => {
  const root = getTestAppElement();
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  elmish.empty(root);
  let counter = 0;
  function signal (action: string) {
    return function callback() {
      if (action === 'inc') counter++;
    }
  }

  const button = document.createElement('button');
  button.id = 'btn';
  elmish.add_attributes(["id=btn", signal('inc')], button);
  root.appendChild(button);

  document.getElementById("btn")?.click();
  t.equal(counter, 1, "Counter incremented via onclick attribute (function)!");
  elmish.empty(root);
  t.end();
});

// Additional tests can be added here as needed
