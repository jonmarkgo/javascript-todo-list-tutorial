// Import necessary types from the types file
import { TodoAction, TodoModel, TodoUpdateFunction, TodoViewFunction, TodoSignalFunction } from './types';

const id: string = 'test-app';

// Define assert function
const assert = {
  equal: (actual: any, expected: any) => {
    if (actual !== expected) throw new Error(`Assertion failed: ${actual} !== ${expected}`);
  },
  deepEqual: (actual: any, expected: any) => {
    if (JSON.stringify(actual) !== JSON.stringify(expected))
      throw new Error(`Assertion failed: ${JSON.stringify(actual)} !== ${JSON.stringify(expected)}`);
  }
};

type Assert = typeof assert;

declare function test(name: string, callback: (assert: Assert) => void): void;
declare function update(action: TodoAction, model: TodoModel): TodoModel;
declare function view(model: TodoModel, signal: TodoSignalFunction): HTMLElement;

// Update the mount function declaration
declare function mount(
  model: TodoModel,
  update: TodoUpdateFunction,
  view: TodoViewFunction,
  root_element_id: string,
  subscriptions?: (signal: TodoSignalFunction) => void
): void;

declare function empty(node: HTMLElement): void;

// Update the div function declaration
declare function div(attrs: string[], children: (HTMLElement | Text)[]): HTMLDivElement;

// Update the test functions to use the correct types
function test_update() {
  const result = update('CLEAR_COMPLETED', { todos: [], hash: '', all_done: false });
  assert.deepEqual(result, { todos: [], hash: '', all_done: false });
}

function test_view() {
  const id = 'test-app';
  document.body.innerHTML = '';
  document.body.appendChild(div([`id=${id}`], []));
  mount({ todos: [], hash: '', all_done: false }, update, view, id);
  const app = document.getElementById(id);
  assert.equal(app !== null, true);
  if (app) {
    assert.equal(app.childNodes.length > 0, true);
  }
}

function test_subscriptions() {
  const id = 'test-app-subs';
  document.body.innerHTML = '';
  document.body.appendChild(div([`id=${id}`], []));
  mount({ todos: [], hash: '', all_done: false }, update, view, id);
  const result = update('CLEAR_COMPLETED', { todos: [], hash: '', all_done: false });
  assert.deepEqual(result, { todos: [], hash: '', all_done: false });
}

// Export the test functions
export { test_update, test_view, test_subscriptions };

// Update existing tests to use correct TodoAction types and TodoModel structure
test('update({todos:[]}) returns {todos:[]} (current state unmodified)',
    function(assert: Assert) {
  const result = update('ADD', { todos: [], hash: '', all_done: false });
  assert.deepEqual(result, { todos: [{ id: 1, title: '', done: false }], hash: '', all_done: false });
});

test('Test Update increment', function(assert: Assert) {
  const result = update('ADD', { todos: [], hash: '', all_done: false });
  assert.deepEqual(result, { todos: [{ id: 1, title: '', done: false }], hash: '', all_done: false });
});

test('Test Update decrement', function(assert: Assert) {
  const result = update('DELETE', { todos: [{ id: 1, title: '', done: false }], hash: '', all_done: false });
  assert.deepEqual(result, { todos: [], hash: '', all_done: false });
});

test('Test toggle todo', function(assert: Assert) {
  const result = update('TOGGLE', { todos: [{ id: 1, title: '', done: false }], hash: '', all_done: false });
  assert.deepEqual(result, { todos: [{ id: 1, title: '', done: true }], hash: '', all_done: false });
});

test('mount sets initial state', function(assert: Assert) {
  mount({ todos: [], hash: '', all_done: false }, update, view, id);
  const state = document.getElementById(id)
    ?.getElementsByClassName('todo-count')[0]?.textContent;
  assert.equal(state, '0 items left');
});

test('empty("test-app") should clear DOM in root node', function(assert: Assert) {
  empty(document.getElementById(id) as HTMLElement);
  mount({ todos: [], hash: '', all_done: false }, update, view, id);
  empty(document.getElementById(id) as HTMLElement);
  const result = document.getElementById(id)?.innerHTML;
  assert.equal(result, '');
});

test('click on "+" button to add a new todo',
function(assert: Assert) {
  document.body.appendChild(div([`id=${id}`], []));
  mount({ todos: [], hash: '', all_done: false }, update, view, id);
  const addButton = document.getElementById(id)?.getElementsByClassName('new-todo')[0] as HTMLInputElement;
  addButton.value = 'New Todo';
  addButton.dispatchEvent(new KeyboardEvent('keyup', {'key': 'Enter'}));
  const state = document.getElementById(id)
    ?.getElementsByClassName('todo-count')[0]?.textContent;
  assert.equal(state, '1 item left');
  empty(document.getElementById(id) as HTMLElement);
});

// Reset Functionality

test('Test clear completed todos', function(assert: Assert) {
  const result = update('CLEAR_COMPLETED', {todos: [{ id: 1, title: '', done: true }], hash: '', all_done: false});
  assert.deepEqual(result, {todos: [], hash: '', all_done: false});
});

test('clear completed button should be present on page', function(assert: Assert) {
  mount({ todos: [{ id: 1, title: '', done: true }], hash: '', all_done: false }, update, view, id);
  const clearCompleted = document.getElementsByClassName('clear-completed');
  assert.equal(clearCompleted.length, 1);
  empty(document.getElementById(id) as HTMLElement);
});

test('Click clear completed button removes completed todos', function(assert: Assert) {
  mount({todos: [{ id: 1, title: '', done: true }, { id: 2, title: '', done: false }], hash: '', all_done: false}, update, view, id);
  const root = document.getElementById(id);
  assert.equal(root?.getElementsByClassName('todo-count')[0].textContent, '1 item left');
  const btn = root?.getElementsByClassName("clear-completed")[0] as HTMLElement;
  btn?.click();
  const state = root?.getElementsByClassName('todo-count')[0]?.textContent;
  assert.equal(state, '1 item left');
  empty(root as HTMLElement);
});
