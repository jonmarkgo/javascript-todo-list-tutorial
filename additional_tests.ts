import test from 'tape';
import { update } from '../src/todo-app';
import { TodoModel } from './minimal-import.test';

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
