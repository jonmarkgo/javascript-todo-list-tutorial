import { describe, it, expect, beforeEach, afterEach, afterAll } from '@jest/globals';
import 'jest-localstorage-mock';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

const html = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
import jsdomGlobal from 'jsdom-global';
const cleanup = jsdomGlobal(html);
import * as app from '../lib/todo-app.js';
const id = 'test-app';
import * as elmish from '../lib/elmish.js';

// Type assertion for app.model
const appModel = app as unknown as { model: { todos: any[], hash: string } };

describe('Todo App Functionality Tests', () => {
  let signalFunction: any;

  beforeEach(() => {
    document.body.innerHTML = `<div id="${id}"></div>`;
    localStorage.clear();
    const model = { todos: [], hash: '#/' };
    elmish.mount(model as any, app.update, app.view, id, (signal) => {
      signalFunction = signal;
    });
  });

  afterAll(() => {
    cleanup();
  });

  function waitForDomUpdate(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0));
  }

  // Existing 'New Todo' test remains unchanged
  it('New Todo: should allow me to add todo items', () => {
    elmish.mount({ todos: [] } as any, app.update, app.view, id, app.subscriptions);
    const new_todo = document.getElementById('new-todo') as HTMLInputElement;
    const todo_text = 'Make Everything Awesome!     ';
    new_todo.value = todo_text;
    document.dispatchEvent(new KeyboardEvent('keyup', { 'keyCode': 13 }));

    const items = document.querySelectorAll('.view');
    expect(items.length).toBe(1);

    const actual = document.getElementById('1')?.textContent;
    expect(actual).toBe(todo_text.trim());

    expect(new_todo.value).toBe('');

    const main = document.getElementById('main');
    const footer = document.getElementById('footer');
    expect(main?.style.display).toBe('block');
    expect(footer?.style.display).toBe('block');
  });

  // Modified 'Counter' test to use async/await
  it('Counter: should display the current number of todo items', async () => {
    console.log('Initial model:', JSON.stringify(JSON.parse(localStorage.getItem('todos-elmish_' + id) || '{}')));

    const addTodo = async (title: string) => {
      signalFunction('ADD', title)();
      await waitForDomUpdate();
      console.log(`Added todo: ${title}`);
    };

    await addTodo('Make something people want.');
    await addTodo('Bootstrap for as long as you can');
    await addTodo('Let\'s solve our own problem');

    await waitForDomUpdate();

    const countElement = document.getElementById('count');
    const count = countElement ? parseInt(countElement.textContent || '0', 10) : 0;
    console.log(`Current count: ${count}`);
    console.log('Final model:', JSON.stringify(JSON.parse(localStorage.getItem('todos-elmish_' + id) || '{}')));
    expect(count).toBe(3);

    const storedModel = JSON.parse(localStorage.getItem('todos-elmish_' + id) || '{}');
    expect(storedModel.todos.length).toBe(3);

    elmish.empty(document.getElementById(id) as HTMLElement);
    localStorage.removeItem('todos-elmish_' + id);
  });

  it('Clear Completed: should display the number of completed items', async () => {
    const addTodo = async (title: string) => {
      signalFunction('ADD', title)();
      await waitForDomUpdate();
    };

    await addTodo('Make something people want.');
    await addTodo('Bootstrap for as long as you can');
    await addTodo('Let\'s solve our own problem');

    const todoItems = document.querySelectorAll('.toggle') as NodeListOf<HTMLInputElement>;
    if (todoItems[1]) {
      todoItems[1].click();
      await waitForDomUpdate();
    }
    if (todoItems[2]) {
      todoItems[2].click();
      await waitForDomUpdate();
    }

    // Force a re-render and update the model
    signalFunction('CLEAR_COMPLETED')();
    await waitForDomUpdate();

    // Check if the todos are actually marked as completed in the model
    const updatedModel = JSON.parse(localStorage.getItem('todos-elmish_' + id) || '{}');
    const remainingTodos = updatedModel.todos.filter((todo: any) => !todo.done);
    expect(remainingTodos.length).toBe(1);

    const todoList = document.querySelectorAll('.view');
    expect(todoList.length).toBe(1);

    elmish.empty(document.getElementById(id) as HTMLElement);
    localStorage.removeItem('todos-elmish_' + id);
  });

  it('Persistence: should persist its data', async () => {
    const addTodo = async (title: string) => {
      signalFunction('ADD', title)();
      await waitForDomUpdate();
    };

    await addTodo('Make something people want.');

    const updatedModel = JSON.parse(localStorage.getItem('todos-elmish_' + id) || '{}');
    expect(updatedModel.todos?.length).toBe(1);
    expect(updatedModel.todos?.[0].title).toBe('Make something people want.');

    elmish.empty(document.getElementById(id) as HTMLElement);
    localStorage.removeItem('todos-elmish_' + id);
  });

  it('Routing: should allow me to display active/completed/all items', async () => {
    const addTodo = async (title: string) => {
      signalFunction('ADD', title)();
      await waitForDomUpdate();
    };

    await addTodo('Make something people want.');
    await addTodo('Bootstrap for as long as you can');
    await addTodo('Let\'s solve our own problem');

    const todoItems = document.querySelectorAll('.toggle') as NodeListOf<HTMLInputElement>;
    if (todoItems[1]) {
      todoItems[1].click();
      await waitForDomUpdate();
    }
    if (todoItems[2]) {
      todoItems[2].click();
      await waitForDomUpdate();
    }

    console.log('Initial state:', JSON.parse(localStorage.getItem('todos-elmish_' + id) || '{}'));

    // Test active items
    window.location.hash = '#/active';
    signalFunction('ROUTE')(); // Manually trigger ROUTE action
    await waitForDomUpdate();

    let items = document.querySelectorAll('.view');
    console.log('Active items count:', items.length);
    console.log('Current hash:', window.location.hash);
    expect(items.length).toBe(1);

    // Test completed items
    window.location.hash = '#/completed';
    signalFunction('ROUTE')(); // Manually trigger ROUTE action
    await waitForDomUpdate();

    items = document.querySelectorAll('.view');
    console.log('Completed items count:', items.length);
    console.log('Current hash:', window.location.hash);
    expect(items.length).toBe(2);

    // Test all items
    window.location.hash = '#/';
    signalFunction('ROUTE')(); // Manually trigger ROUTE action
    await waitForDomUpdate();

    items = document.querySelectorAll('.view');
    console.log('All items count:', items.length);
    console.log('Current hash:', window.location.hash);
    expect(items.length).toBe(3);

    // Verify the model state
    const updatedModel = JSON.parse(localStorage.getItem('todos-elmish_' + id) || '{}');
    console.log('Final state:', updatedModel);
    expect(updatedModel.todos.length).toBe(3);
    expect(updatedModel.todos.filter((todo: any) => !todo.done).length).toBe(1);
    expect(updatedModel.todos.filter((todo: any) => todo.done).length).toBe(2);

    elmish.empty(document.getElementById(id) as HTMLElement);
    localStorage.removeItem('todos-elmish_' + id);
  });
});
