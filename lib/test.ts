// Import necessary functions from lib/elmish.ts
import { mount, empty } from './elmish';

// Import the update function from lib/todo-app.ts
import { update } from './todo-app';

// Define the Model interface based on what we know from lib/todo-app.ts
interface Todo {
  id: number;
  title: string;
  done: boolean;
}

interface Model {
  todos: Todo[];
  hash: string;
  clicked?: number;
  click_time?: number;
  editing?: number;
  all_done?: boolean;
}

const id: string = 'test-app';

interface Assert {
  equal: (actual: any, expected: any) => void;
}

// Define the SignalFunction type
type SignalFunction = (action: string, data?: any, model?: Model) => () => void;

declare function test(name: string, callback: (assert: Assert) => void): void;
declare function div(id: string): HTMLElement;

// Define a mock view function for testing purposes
function view(model: Model, signal: SignalFunction): HTMLElement {
  return document.createElement('div');
}

// Test cases
test('update with unknown action returns unmodified model', function(assert: Assert) {
  const model: Model = { todos: [], hash: '#/' };
  const result = update('UNKNOWN_ACTION', model);
  assert.equal(JSON.stringify(result), JSON.stringify(model));
});

test('mount sets initial state correctly', function(assert: Assert) {
  const initialModel: Model = { todos: [{ id: 1, title: 'Test', done: false }], hash: '#/' };
  mount(initialModel, update, view, id);
  const state = document.getElementById(id)
    ?.getElementsByClassName('count')[0]?.textContent;
  assert.equal(state, '1');
});

test('empty removes all child elements', function(assert: Assert) {
  const element = document.getElementById(id);
  if (element) {
    empty(element);
    mount({ todos: [{ id: 1, title: 'Test', done: false }], hash: '#/' }, update, view, id);
    empty(element);
    const result = element.innerHTML;
    assert.equal(result, '');
  }
});

test('update adds a new todo', function(assert: Assert) {
  const model: Model = { todos: [], hash: '#/' };
  const result = update('ADD', model, 'New Todo');
  assert.equal(result.todos.length, 1);
  assert.equal(result.todos[0].title, 'New Todo');
});

test('update toggles a todo', function(assert: Assert) {
  const model: Model = { todos: [{ id: 1, title: 'Test', done: false }], hash: '#/' };
  const result = update('TOGGLE', model, 1);
  assert.equal(result.todos[0].done, true);
});

test('update deletes a todo', function(assert: Assert) {
  const model: Model = { todos: [{ id: 1, title: 'Test', done: false }], hash: '#/' };
  const result = update('DELETE', model, 1);
  assert.equal(result.todos.length, 0);
});

test('empty("test-app") should clear DOM in root node', function(assert: Assert) {
  const element = document.getElementById(id);
  if (element) {
    empty(element);
    mount({ todos: [{ id: 1, title: 'Test', done: false }], hash: '#/' }, update, view, id);
    empty(element);
    const result = element.innerHTML;
    assert.equal(result, '');
  }
});

test('click on "+" button to re-render state (increment model by 1)',
function(assert: Assert) {
  document.body.appendChild(div(id));
  mount({ todos: [], hash: '#/' }, update, view, id);
  const addButton = document.getElementById(id)?.getElementsByClassName('add')[0] as HTMLElement;
  addButton?.click();
  const state = document.getElementById(id)
    ?.getElementsByClassName('todo-count')[0].textContent;
  assert.equal(state?.trim(), '1 item left'); // model was incremented successfully
  const element = document.getElementById(id);
  if (element) empty(element); // clean up after tests
});

// Reset Functionality

test('Test clear completed todos', function(assert: Assert) {
  const model: Model = {
    todos: [
      { id: 1, title: 'Test 1', done: true },
      { id: 2, title: 'Test 2', done: false }
    ],
    hash: '#/'
  };
  const result = update('CLEAR_COMPLETED', model);
  assert.equal(result.todos.length, 1);
  assert.equal(result.todos[0].title, 'Test 2');
});

test('clear completed button should be present on page', function(assert: Assert) {
  mount({ todos: [{ id: 1, title: 'Test', done: true }], hash: '#/' }, update, view, id);
  const clearCompleted: HTMLCollectionOf<Element> = document.getElementsByClassName('clear-completed');
  assert.equal(clearCompleted.length, 1);
});

test('Click clear completed button removes completed todos', function(assert: Assert) {
  const initialModel: Model = {
    todos: [
      { id: 1, title: 'Test 1', done: true },
      { id: 2, title: 'Test 2', done: false }
    ],
    hash: '#/'
  };
  mount(initialModel, update, view, id);
  const root = document.getElementById(id);
  const btn = root?.getElementsByClassName("clear-completed")[0] as HTMLElement;
  btn?.click(); // Click the Clear completed button!
  const remainingTodos = root?.getElementsByClassName('todo-list')[0].children.length;
  assert.equal(remainingTodos, 1); // Only one todo should remain
  if (root) empty(root); // clean up after tests
});
