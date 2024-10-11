import test from 'tape';
import * as elmish from '../src/elmish';
import { update, view } from '../src/todo-app';
import { JSDOM } from 'jsdom';

console.log('Debug: Starting minimal-import.test.ts');

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

export interface TodoModel {
  todos: Array<{ id: number; title: string; done: boolean }>;
  hash: string;
}

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

test('ADD action adds a new todo item', (t: any) => {
  console.log('Debug: Running test - ADD action adds a new todo item');
  t.plan(2);
  const initialModel: TodoModel = { todos: [], hash: '#/' };
  const newTodo = 'Learn TDD';
  const updatedModel = update('ADD', initialModel, newTodo);

  t.equal(updatedModel.todos.length, 1, 'A new todo item is added');
  t.equal(updatedModel.todos[0].title, newTodo, 'The new todo has the correct title');
  console.log('Debug: Test completed');
  t.end();
});

test('TOGGLE action toggles the done status of a todo item', (t: any) => {
  console.log('Debug: Running test - TOGGLE action toggles the done status of a todo item');
  t.plan(2);
  const initialModel: TodoModel = {
    todos: [{ id: 1, title: 'Learn Elm Architecture', done: false }],
    hash: '#/'
  };
  const updatedModel = update('TOGGLE', initialModel, 1);

  t.true(updatedModel.todos[0].done, 'Todo item is marked as done');
  t.equal(updatedModel.todos[0].title, 'Learn Elm Architecture', 'Todo item title remains unchanged');
  console.log('Debug: Test completed');
  t.end();
});

test('DELETE action removes a todo item', (t: any) => {
  console.log('Debug: Running test - DELETE action removes a todo item');
  t.plan(1);
  const initialModel: TodoModel = {
    todos: [
      { id: 1, title: 'Learn Elm Architecture', done: false },
      { id: 2, title: 'Build Todo App', done: false }
    ],
    hash: '#/'
  };
  const updatedModel = update('DELETE', initialModel, 1);

  t.equal(updatedModel.todos.length, 1, 'One todo item is removed');
  console.log('Debug: Test completed');
  t.end();
});

console.log('Debug: All tests completed');
