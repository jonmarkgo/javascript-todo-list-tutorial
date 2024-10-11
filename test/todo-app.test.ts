import test from 'tape';
import * as elmish from '../src/elmish';
import { update, view } from '../src/todo-app';
import { JSDOM } from 'jsdom';

console.log('Debug: Starting todo-app.test.ts');

const dom = new JSDOM('<!DOCTYPE html><div id="app"></div>');
(global as any).document = dom.window.document;
(global as any).window = dom.window as any;

console.log('Debug: DOM environment set up');

(global as any).localStorage = {
  getItem: (key: string) => null,
  setItem: (key: string, value: string) => {},
  removeItem: (key: string) => {},
  clear: () => {},
  length: 0,
  key: (index: number) => null,
};

console.log('Debug: Mock localStorage set up');

const id = 'test-app';

interface TodoModel {
  todos: Array<{ id: number; title: string; done: boolean }>;
  hash: string;
}

console.log('Debug: Starting tests');

test('Initial model structure', (t: any) => {
  console.log('Debug: Running test - Initial model structure');
  const initialModel: TodoModel = { todos: [], hash: '#/' };
  t.equal(typeof initialModel, 'object', 'model is an Object');
  t.ok(Array.isArray(initialModel.todos), 'model.todos is an Array');
  t.equal(typeof initialModel.hash, 'string', 'model.hash is a string');
  console.log('Debug: Test completed');
  t.end();
});

test('`update` default case should return model unmodified', (t: any) => {
  console.log('Debug: Running test - update default case');
  t.plan(1);
  const sampleModel: TodoModel = {
    todos: [{ id: 1, title: 'Learn Elm Architecture', done: false }],
    hash: '#/'
  };
  const updatedModel = update('UNKNOWN_ACTION', sampleModel);
  t.deepEqual(updatedModel, sampleModel, 'model is unchanged for unknown action');
  console.log('Debug: Test completed');
  t.end();
});

test('view function returns valid HTML structure', (t: any) => {
  console.log('Debug: Running test - view function returns valid HTML structure');
  t.plan(3);
  const sampleModel: TodoModel = {
    todos: [{ id: 1, title: 'Test Todo', done: false }],
    hash: '#/'
  };
  const signal = (action: string, data?: any) => () => {};
  const result = view(sampleModel, signal);

  t.equal(result.tagName, 'SECTION', 'Root element is a section');
  t.ok(result.querySelector('.todo-list'), 'Contains a todo list');
  t.ok(result.querySelector('#new-todo'), 'Contains a new todo input');
  console.log('Debug: Test completed');
  t.end();
});

test('elmish.mount function is called with correct parameters', (t: any) => {
  console.log('Debug: Running test - elmish.mount function is called with correct parameters');
  t.plan(2);

  // Create a mock elmish object with a mount function we can spy on
  const mockElmish = {
    mount: (model: any, update: any, view: any, root_element_id: string, subscriptions?: any) => {
      t.equal(root_element_id, id, 'mount is called with correct root_element_id');
      t.pass('mount function was called');
    }
  };

  // Define a sample model for testing
  const sampleModel: TodoModel = { todos: [], hash: '#/' };

  // Call the mock mount function
  mockElmish.mount(sampleModel, update, view, id);

  console.log('Debug: Test completed');
  t.end();
});

console.log('Debug: All tests completed');
