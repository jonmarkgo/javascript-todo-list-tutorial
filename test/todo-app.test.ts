import test from 'tape';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'));

import jsdomGlobal from 'jsdom-global';
jsdomGlobal(html);
import * as app from '../lib/todo-app';
import { Model, Todo } from '../lib/todo-app';
import * as elmish from '../lib/elmish';

const id = 'test-app';

// mock the localStorage:
const store: { [key: string]: string } = {};

function mock_signal(): (action: any) => void {
  return function(action: any) {
    console.log('Mock signal called with action:', action);
  };
}

// Start of tests
test('render_main "main" view using (elmish) HTML DOM functions', function (t: test.Test) {
  const model: Model = {
    todos: [
      { id: 0, title: "Make something people want.", done: false },
      { id: 1, title: "Bootstrap for as long as you can", done: false },
      { id: 2, title: "Let's solve our own problem", done: false }
    ],
    hash: '#/'
  };

  // ... (rest of the test code)
  t.end();
});

// ... (other test cases)

test('9. Routing > should allow me to display active/completed/all items', function (t) {
  localStorage.removeItem('todos-elmish_' + id);
  const rootElement = document.getElementById(id);
  if (rootElement) {
    elmish.empty(rootElement);
  }
  const routingModel: Model = {
    todos: [
      { id: 0, title: "Make something people want.", done: false },
      { id: 1, title: "Bootstrap for as long as you can", done: true },
      { id: 2, title: "Let's solve our own problem", done: false }
    ],
    hash: '#/'
  };
  // render the view and append it to the DOM inside the `test-app` node:
  elmish.mount(routingModel, app.update, app.view, id, app.subscriptions);

  // show ACTIVE items:
  routingModel.hash = '#/active';
  elmish.mount(routingModel, app.update, app.view, id, app.subscriptions);
  const activeItems = document.querySelectorAll('.view');
  t.equal(activeItems.length, 2, "should display 2 active items");
  const selected = document.querySelector('.selected');
  if (selected) {
    t.equal(selected.id, 'active', "active footer filter is selected");
  }

  // empty:
  if (rootElement) {
    elmish.empty(rootElement);
  }
  localStorage.removeItem('todos-elmish_' + id);
  // show COMPLETED items:
  routingModel.hash = '#/completed';
  elmish.mount(routingModel, app.update, app.view, id, app.subscriptions);
  const completedItems = document.querySelectorAll('.view');
  t.equal(completedItems.length, 1, "should display 1 completed item");
  const selectedCompleted = document.querySelector('.selected');
  if (selectedCompleted) {
    t.equal(selectedCompleted.id, 'completed', "completed footer filter is selected");
  }

  // empty:
  if (rootElement) {
    elmish.empty(rootElement);
  }
  localStorage.removeItem('todos-elmish_' + id);
  // show ALL items:
  routingModel.hash = '#/';
  elmish.mount(routingModel, app.update, app.view, id, app.subscriptions);
  const allItems = document.querySelectorAll('.view');
  t.equal(allItems.length, 3, "should display 3 items (all)");
  const selectedAll = document.querySelector('.selected');
  if (selectedAll) {
    t.equal(selectedAll.id, 'all', "all footer filter is selected");
  }

  if (rootElement) {
    elmish.empty(rootElement); // clear DOM ready for next test
  }
  localStorage.removeItem('todos-elmish_' + id);
  t.end();
});

// End of test file
