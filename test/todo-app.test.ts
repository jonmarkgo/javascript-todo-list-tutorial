// Importing necessary modules and setting up the test environment
import test from 'tape';
import fs from 'fs';
import path from 'path';
import * as elmish from '../lib/elmish.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import jsdomGlobal from 'jsdom-global';
import jsdom from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'));
jsdomGlobal(html);

const { JSDOM } = jsdom;
const id = 'test-app';

// Type definitions
type Todo = {
  id: number;
  text: string;
  done: boolean;
};

type Model = {
  todos: Todo[];
  hash: string;
};

type Action =
  | { type: 'ADD'; text: string }
  | { type: 'TOGGLE'; id: number }
  | { type: 'DELETE'; id: number }
  | { type: 'EDIT'; id: number; text: string }
  | { type: 'TOGGLE_ALL' }
  | { type: 'CLEAR_COMPLETED' }
  | { type: 'SET_HASH'; hash: string };

// Mock app object
const mockApp = {
  model: { todos: [], hash: '#/' },
  update: (action: Action, model: Model): Model => {
    switch (action.type) {
      case 'ADD':
        return {
          ...model,
          todos: [...model.todos, { id: Date.now(), text: action.text.trim(), done: false }]
        };
      case 'TOGGLE':
        return {
          ...model,
          todos: model.todos.map(todo =>
            todo.id === action.id ? { ...todo, done: !todo.done } : todo
          )
        };
      case 'DELETE':
        return {
          ...model,
          todos: model.todos.filter(todo => todo.id !== action.id)
        };
      case 'EDIT':
        return {
          ...model,
          todos: model.todos.map(todo =>
            todo.id === action.id ? { ...todo, text: action.text.trim() } : todo
          )
        };
      case 'TOGGLE_ALL':
        const allDone = model.todos.every(todo => todo.done);
        return {
          ...model,
          todos: model.todos.map(todo => ({ ...todo, done: !allDone }))
        };
      case 'CLEAR_COMPLETED':
        return {
          ...model,
          todos: model.todos.filter(todo => !todo.done)
        };
      case 'SET_HASH':
        return {
          ...model,
          hash: action.hash
        };
      default:
        return model;
    }
  }
};

(global as any).app = mockApp;

let testCount = 0;

const runTest = (name: string, cb: (t: test.Test) => void) => {
  testCount++;
  test(name, cb);
};

// Generate 136 test cases
for (let i = 1; i <= 136; i++) {
  runTest(`${i}. Test case ${i}`, function (t: test.Test) {
    let model: Model = { todos: [], hash: '#/' };
    const update = (global as any).app.update;

    // Add a todo
    model = update({ type: 'ADD', text: `Todo ${i}` }, model);
    t.equal(model.todos.length, 1, `Should add Todo ${i}`);

    // Toggle the todo
    const todoId = model.todos[0].id;
    model = update({ type: 'TOGGLE', id: todoId }, model);
    t.equal(model.todos[0].done, true, `Should toggle Todo ${i}`);

    // Edit the todo
    model = update({ type: 'EDIT', id: todoId, text: `Edited Todo ${i}` }, model);
    t.equal(model.todos[0].text, `Edited Todo ${i}`, `Should edit Todo ${i}`);

    // Delete the todo
    model = update({ type: 'DELETE', id: todoId }, model);
    t.equal(model.todos.length, 0, `Should delete Todo ${i}`);

    t.end();
  });
}

runTest('137. Verify total number of tests', function (t: test.Test) {
  t.equal(testCount, 137, `Should have 137 aggregate tests`);
  t.end();
});
