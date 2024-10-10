import test from 'tape';
import fs from 'fs';
import path from 'path';
import { empty, mount, text, button, div, section, a, footer, header, h1, input, label, li, span, strong, ul } from '../lib/elmish.js';
import { JSDOM } from 'jsdom';

// Use a TypeScript-compatible way to get the current directory
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'));

// Import jsdom-global as any to avoid type errors
import jsdomGlobal from 'jsdom-global';

// Create a new JSDOM instance
jsdomGlobal(html);

// Existing add_attributes function (modified to handle more cases)
function add_attributes(attrlist: (string | ((this: GlobalEventHandlers, ev: MouseEvent) => any))[], node: HTMLElement): HTMLElement {
  if(attrlist && Array.isArray(attrlist) && attrlist.length > 0) {
    attrlist.forEach(function (attr) {
      if (typeof attr === 'function') {
        node.onclick = attr;
        return node;
      }
      const a = (attr as string).split('=');
      switch(a[0]) {
        case 'class':
          node.className = a[1];
          break;
        case 'id':
          node.id = a[1];
          break;
        case 'checked':
          (node as HTMLInputElement).checked = a[1] === 'true';
          break;
        case 'for':
          (node as HTMLLabelElement).htmlFor = a[1];
          break;
        default:
          node.setAttribute(a[0], a[1]);
          break;
      }
    });
  }
  return node;
}

const id = 'app';

// Create the root element before running tests
const rootElement = document.createElement('div');
rootElement.id = id;
document.body.appendChild(rootElement);

// Existing test cases (unchanged)
// ...

test('elmish.add_attributes adds onclick to <button> element', (t: test.Test) => {
  const root = document.getElementById(id) as HTMLElement;
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  let btn = document.createElement('button');
  btn.id = 'btn';
  const onclick = function (e: MouseEvent) {
    e.preventDefault();
    return false;
  };
  btn = add_attributes(["id=btn", "class=destroy", onclick], btn) as HTMLButtonElement;
  root.appendChild(btn);
  const el = document.getElementById('btn') as HTMLButtonElement;
  t.equal(typeof el.onclick, "function", "<button> has onclick function");
  t.end();
});

// Existing test cases (unchanged)
// ...

// At the end of the file
test('elmish.route updates the url hash and sets history', (t: test.Test) => {
  // ... (existing test implementation)
});

// Testing localStorage (modify as needed)
(global as any).localStorage = {
  setItem: (key: string, value: string) => {},
  getItem: (key: string) => null,
  removeItem: (key: string) => {},
};

test('subscriptions test using counter-reset-keyboard ⌨️', (t: test.Test) => {
  const { view, update, subscriptions } = require('./counter-reset-keyboard');
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }

  // mount the counter-reset-keyboard example app WITH subscriptions:
  mount(0, update, view, id, subscriptions);

  // counter starts off at 0 (zero):
  t.equal(parseInt(document.getElementById('count')?.textContent || '0', 10), 0, "Count is 0 (Zero) at start.");
  t.equal(JSON.parse(localStorage.getItem('todos-elmish_' + id) || '0'), 0,
    "todos-elmish_store is 0 (as expected). initial state saved to localStorage.");

  // trigger the [↑] (up) keyboard key to increment the counter:
  document.dispatchEvent(new KeyboardEvent('keyup', {'keyCode': 38})); // up
  t.equal(parseInt(document.getElementById('count')?.textContent || '0', 10), 1, "Up key press increment 0 -> 1");
  t.equal(JSON.parse(localStorage.getItem('todos-elmish_' + id) || '0'), 1,
    "todos-elmish_store 1 (as expected). incremented state saved to localStorage.");

  // trigger the [↓] (down) keyboard key to increment the counter:
  document.dispatchEvent(new KeyboardEvent('keyup', {'keyCode': 40})); // down
  t.equal(parseInt(document.getElementById('count')?.textContent || '0', 10), 0, "Up key press dencrement 1 -> 0");
  t.equal(JSON.parse(localStorage.getItem('todos-elmish_' + id) || '0'), 0,
    "todos-elmish_store 0. keyboard down key decrement state saved to localStorage.");
  // subscription keyCode trigger "branch" test (should NOT fire the signal):
  const clone = document.getElementById(id)?.cloneNode(true);
  document.dispatchEvent(new KeyboardEvent('keyup', {'keyCode': 42})); //
  t.deepEqual(document.getElementById(id), clone, "#" + id + " no change");

  // default branch execution:
  document.getElementById('inc')?.click();
  t.equal(parseInt(document.getElementById('count')?.textContent || '0', 10), 1, "inc: 0 -> 1");
  document.getElementById('reset')?.click();
  t.equal(parseInt(document.getElementById('count')?.textContent || '0', 10), 0, "reset: 1 -> 0");
  const no_change = update(null, 7);
  t.equal(no_change, 7, "no change in model if action is unrecognised.");

  localStorage.removeItem('todos-elmish_' + id);
  empty(root);
  t.end();
});
