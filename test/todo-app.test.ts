import test from 'tape';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8');

// @ts-ignore
import jsdomGlobal from 'jsdom-global';
jsdomGlobal(html);

import * as app from '../lib/todo-app';
import * as elmish from '../lib/elmish';

// Type declarations
interface Todo {
  id: number;
  title: string;
  done: boolean;
}

interface Model {
  todos: Todo[];
  hash: string;
}

type UpdateFunction = (action: string, model: Model) => Model;
type RenderFunction = (model: Model) => HTMLElement;

const id = 'test-app';

// Helper function to safely get HTMLElement
function getElement(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Element with id "${id}" not found`);
  }
  return element;
}

// Declare mount function
declare function mount(model: Model, update: UpdateFunction, view: RenderFunction, id: string): void;

// Update test cases to use getElement and fix type issues
test('2. New Todo, should allow me to add todo items', function (t: any) {
  elmish.empty(getElement(id));
  mount({todos: [], hash: '#/'}, app.update as UpdateFunction, app.view as RenderFunction, id);
  // ... existing test case content ...
  t.end();
});

test('3. Mark all as completed ("TOGGLE_ALL")', function (t: any) {
  elmish.empty(getElement(id));
  const model: Model = {
    todos: [
      { id: 0, title: "Make JavaScript Great Again!", done: false },
      { id: 1, title: "Learn how to use elmish with JavaScript", done: false }
    ],
    hash: '#/' // the "route" to display
  };
  mount(model, app.update as UpdateFunction, app.view as RenderFunction, id);
  // ... existing test case content ...
  t.end();
});

test('4.1 DELETE item by clicking <button class="destroy">', function (t: any) {
  elmish.empty(getElement(id));
  const testModel: Model = {
    todos: [{ id: 0, title: "Make JavaScript Great Again!", done: false }],
    hash: '#/'
  };
  mount(testModel, app.update as UpdateFunction, app.view as RenderFunction, id);
  const item = document.getElementById('0');
  t.equal(item?.textContent?.trim(), testModel.todos[0].title, 'Item contained in DOM.');
  // ... existing test case content ...
  t.end();
});

// Continue updating other test cases...
test('5.1 Editing: > Render an item in "editing mode"', function (t: any) {
  elmish.empty(getElement(id));
  localStorage.removeItem('todos-elmish_' + id);
  const model: Model & { editing: number } = {
    todos: [
      { id: 0, title: "Make something people want.", done: false },
      { id: 1, title: "Bootstrap for as long as you can", done: false },
      { id: 2, title: "Let's solve our own problem", done: false }
    ],
    hash: '#/', // the "route" to display
    editing: 2 // edit the 3rd todo list item (which has id == 2)
  };
  mount(model, app.update as UpdateFunction, app.view as RenderFunction, id);
  // ... existing test case content ...
  t.end();
});

test('5.2 Double-click an item <label> to edit it', function (t: any) {
  elmish.empty(getElement(id));
  localStorage.removeItem('todos-elmish_' + id);
  const model: Model = {
    todos: [
      { id: 0, title: "Make something people want.", done: false },
      { id: 1, title: "Let's solve our own problem", done: false }
    ],
    hash: '#/' // the "route" to display
  };
  mount(model, app.update as UpdateFunction, app.view as RenderFunction, id);
  // ... existing test case content ...
  t.end();
});

test('5.2.2 Slow clicks do not count as double-click > no edit!', function (t: any) {
  elmish.empty(getElement(id));
  localStorage.removeItem('todos-elmish_' + id);
  const model: Model = {
    todos: [
      { id: 0, title: "Make something people want.", done: false },
      { id: 1, title: "Let's solve our own problem", done: false }
    ],
    hash: '#/' // the "route" to display
  };
  mount(model, app.update as UpdateFunction, app.view as RenderFunction, id);
  // ... existing test case content ...
  t.end();
});

test('5.3 [ENTER] Key in edit mode triggers SAVE action', function (t: any) {
  elmish.empty(getElement(id));
  localStorage.removeItem('todos-elmish_' + id);
  const model: Model & { editing: number } = {
    todos: [
      { id: 0, title: "Make something people want.", done: false },
      { id: 1, title: "Let's solve our own problem", done: false }
    ],
    hash: '#/', // the "route" to display
    editing: 1 // edit the 3rd todo list item (which has id == 2)
  };
  mount(model, app.update as UpdateFunction, app.view as RenderFunction, id);
  const updated_title = "Do things that don't scale!  ";
  (document.querySelectorAll('.edit')[0] as HTMLInputElement).value = updated_title;
  document.dispatchEvent(new KeyboardEvent('keyup', {'keyCode': 13}));
  // ... existing test case content ...
  t.end();
});

test('5.4 SAVE should remove the item if an empty text string was entered',
  function (t: any) {
  elmish.empty(getElement(id));
  localStorage.removeItem('todos-elmish_' + id);
  const model: Model & { editing: number } = {
    todos: [
      { id: 0, title: "Make something people want.", done: false },
      { id: 1, title: "Let's solve our own problem", done: false }
    ],
    hash: '#/', // the "route" to display
    editing: 1 // edit the 3rd todo list item (which has id == 2)
  };
  mount(model, app.update as UpdateFunction, app.view as RenderFunction, id);
  // ... existing test case content ...
  t.end();
});

test('5.5 CANCEL should cancel edits on escape', function (t: any) {
  elmish.empty(getElement(id));
  localStorage.removeItem('todos-elmish_' + id);
  const model: Model & { editing: number } = {
    todos: [
      { id: 0, title: "Make something people want.", done: false },
      { id: 1, title: "Let's solve our own problem", done: false }
    ],
    hash: '#/', // the "route" to display
    editing: 1 // edit the 3rd todo list item (which has id == 2)
  };
  mount(model, app.update as UpdateFunction, app.view as RenderFunction, id);
  // ... existing test case content ...
  t.end();
});

test('6. Counter > should display the current number of todo items',
  function (t: any) {
  elmish.empty(getElement(id));
  const model: Model = {
    todos: [
      { id: 0, title: "Make something people want.", done: false },
      { id: 1, title: "Bootstrap for as long as you can", done: false },
      { id: 2, title: "Let's solve our own problem", done: false }
    ],
    hash: '#/'
  };
  mount(model, app.update as UpdateFunction, app.view as RenderFunction, id);
  // ... existing test case content ...
  t.end();
});

test('7. Clear Completed > should display the number of completed items',
  function (t: any) {
  elmish.empty(getElement(id));
  const model: Model = {
    todos: [
      { id: 0, title: "Make something people want.", done: false },
      { id: 1, title: "Bootstrap for as long as you can", done: true },
      { id: 2, title: "Let's solve our own problem", done: true }
    ],
    hash: '#/'
  };
  mount(model, app.update as UpdateFunction, app.view as RenderFunction, id);
  // ... existing test case content ...
  t.end();
});

test('8. Persistence > should persist its data', function (t: any) {
  elmish.empty(getElement(id));
  const model: Model = {
    todos: [
      { id: 0, title: "Make something people want.", done: false }
    ],
    hash: '#/'
  };
  mount(model, app.update as UpdateFunction, app.view as RenderFunction, id);
  // ... existing test case content ...
  t.end();
});

test('9. Routing > should allow me to display active/completed/all items',
  function (t: any) {
  localStorage.removeItem('todos-elmish_' + id);
  elmish.empty(getElement(id));
  const model: Model = {
    todos: [
      { id: 0, title: "Make something people want.", done: false },
      { id: 1, title: "Bootstrap for as long as you can", done: true },
      { id: 2, title: "Let's solve our own problem", done: true }
    ],
    hash: '#/active' // ONLY ACTIVE items
  };
  mount(model, app.update as UpdateFunction, app.view as RenderFunction, id);
  // ... existing test case content ...
  t.end();
});

