import { test, Assert } from 'qunit';
import { TodoState, Todo, UpdateFunction, MountFunction, ViewFunction, EmptyFunction } from './types';

const id: string = 'test-app';

declare const update: UpdateFunction;
declare const mount: MountFunction;
declare const view: ViewFunction;
declare const empty: EmptyFunction;

type TestFunction = (assert: Assert) => void;

test('update("", {todos:[]}) returns {todos:[]} (current state unmodified)', (assert) => {
  const result = update('', { todos: [], hash: '#/' });
  assert.deepEqual(result, { todos: [], hash: '#/' });
});

test('Test Add Todo: update("ADD", model, "New Todo") adds a new todo', (assert) => {
  const initialState: TodoState = { todos: [], hash: '#/' };
  const result = update('ADD', initialState, 'New Todo');
  assert.equal(result.todos.length, 1);
  assert.equal(result.todos[0].title, 'New Todo');
  assert.equal(result.todos[0].done, false);
});

test('Test Toggle Todo: update("TOGGLE", model, id) toggles todo status', (assert) => {
  const initialState: TodoState = {
    todos: [{ id: 1, title: 'Test Todo', done: false }],
    hash: '#/'
  };
  const result = update('TOGGLE', initialState, 1);
  assert.equal(result.todos[0].done, true);
});

test('Test Delete Todo: update("DELETE", model, id) removes a todo', (assert) => {
  const initialState: TodoState = {
    todos: [{ id: 1, title: 'Test Todo', done: false }],
    hash: '#/'
  };
  const result = update('DELETE', initialState, 1);
  assert.equal(result.todos.length, 0);
});

test('mount sets initial state correctly', (assert) => {
  const initialState: TodoState = { todos: [{ id: 1, title: 'Test Todo', done: false }], hash: '#/' };
  mount(initialState, update, view, id);
  const todoElement = document.querySelector('.todo-list li');
  assert.ok(todoElement !== null, 'Todo element should be present');
  assert.equal(todoElement?.textContent?.trim(), 'Test Todo', 'Todo title should be correct');
});

test('empty("test-app") should clear DOM in root node', (assert) => {
  const rootElement = document.getElementById(id);
  if (rootElement) {
    empty(rootElement);
    assert.equal(rootElement.children.length, 0, 'Root element should be empty');
  } else {
    assert.ok(false, 'Root element not found');
  }
});

test('Adding a new todo updates the view', (assert) => {
  const initialState: TodoState = { todos: [], hash: '#/' };
  mount(initialState, update, view, id);

  const newTodoInput = document.getElementById('new-todo') as HTMLInputElement;
  newTodoInput.value = 'New Todo Item';
  newTodoInput.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));

  const todoItems = document.querySelectorAll('.todo-list li');
  assert.equal(todoItems.length, 1, 'One todo item should be added');
  assert.equal(todoItems[0].textContent?.trim(), 'New Todo Item', 'Todo item text should be correct');
});

test('Toggling a todo updates its status', (assert) => {
  const initialState: TodoState = {
    todos: [{ id: 1, title: 'Test Todo', done: false }],
    hash: '#/'
  };
  mount(initialState, update, view, id);

  const toggleCheckbox = document.querySelector('.toggle') as HTMLInputElement;
  toggleCheckbox.click();

  const todoItem = document.querySelector('.todo-list li');
  assert.ok(todoItem?.classList.contains('completed'), 'Todo item should be marked as completed');
});

test('Deleting a todo removes it from the view', (assert) => {
  const initialState: TodoState = {
    todos: [{ id: 1, title: 'Test Todo', done: false }],
    hash: '#/'
  };
  mount(initialState, update, view, id);

  const deleteButton = document.querySelector('.destroy') as HTMLButtonElement;
  deleteButton.click();

  const todoItems = document.querySelectorAll('.todo-list li');
  assert.equal(todoItems.length, 0, 'Todo item should be removed');
});
