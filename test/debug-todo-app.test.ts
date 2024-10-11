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
import * as app from '../src/todo-app';
const id = 'test-app';
import * as elmish from '../src/elmish';

// Mock localStorage
const mockLocalStorage: { [key: string]: string } = {};
Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: (key: string) => mockLocalStorage[key] || null,
    setItem: (key: string, value: string) => { mockLocalStorage[key] = value; },
    removeItem: (key: string) => { delete mockLocalStorage[key]; },
    clear: () => { Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key]); }
  },
  writable: true
});

interface TodoModel {
  todos: Array<{ id: number; title: string; done: boolean }>;
  hash: string;
}

test('Debug: Mark all as completed ("TOGGLE_ALL")', function (t: test.Test) {
  console.log('Debug: Test started');
  const element = document.getElementById(id);
  if (element) {
    elmish.empty(element);
  }
  localStorage.removeItem('todos-elmish_' + id);
  const model: TodoModel = {
    todos: [
      { id: 0, title: "Learn Elm Architecture", done: true },
      { id: 1, title: "Build Todo List App",    done: false },
      { id: 2, title: "Win the Internet!",      done: false }
    ],
    hash: '#/'
  };

  console.log('Debug: Initial model', JSON.stringify(model, null, 2));
  console.log('Debug: Initial localStorage state:', JSON.stringify(mockLocalStorage, null, 2));

  console.log('Debug: Before mount, DOM structure:', document.getElementById(id)?.innerHTML);

  console.log('Debug: Mounting application with model:', JSON.stringify(model, null, 2));
  console.log('Debug: app.view function:', app.view.toString());

  // Wrap the app.view function to add logging
  const wrappedView = (model: TodoModel, signal: Function) => {
    console.log('Debug: app.view called with model:', JSON.stringify(model, null, 2));
    const result = app.view(model, signal);
    console.log('Debug: app.view returned:', result.outerHTML);
    return result;
  };

  elmish.mount(model, app.update, wrappedView, id, app.subscriptions);
  console.log('Debug: Application mounted');

  // Add more detailed logging after mounting
  console.log('Debug: Model after mount:', JSON.stringify(model, null, 2));
  console.log('Debug: DOM structure after mount:', document.getElementById(id)?.innerHTML);

  // Log details about each todo item
  model.todos.forEach((todo, index) => {
    console.log(`Debug: Todo ${index + 1}:`, JSON.stringify(todo, null, 2));
    const todoElement = document.querySelector(`#todo-${todo.id}`);
    console.log(`Debug: Todo ${index + 1} element:`, todoElement ? todoElement.outerHTML : 'Not found in DOM');
  });

  console.log('Debug: After mount, DOM structure:', document.getElementById(id)?.innerHTML);

  const items = document.querySelectorAll('.view input');
  console.log('Debug: Number of todo items found:', items.length);

  console.log('Debug: Todo items:', Array.from(items).map(item => ({
    checked: (item as HTMLInputElement).checked,
    parentHTML: item.parentElement?.innerHTML
  })));

  t.equal(items.length, 3, "there are 3 todo items in the DOM");

  if (items.length > 0) {
    t.equal((items[0] as HTMLInputElement).checked, true, "only first item is checked");
  } else {
    t.fail("No todo items found in the DOM");
  }

  console.log('Debug: Final localStorage state:', JSON.stringify(mockLocalStorage, null, 2));
  console.log('Debug: Final DOM structure:', document.getElementById(id)?.innerHTML);

  if (element) {
    elmish.empty(element);
  }
  localStorage.removeItem('todos-elmish_store');
  console.log('Debug: Test ended');
  t.end();
});
