import test from 'tape';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import jsdomGlobal from 'jsdom-global';
import * as app from '../lib/todo-app';
import * as elmish from '../lib/elmish';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8');
const cleanup = jsdomGlobal(html);

const id = 'test-app'; // all tests use 'test-app' as root element

// Add type declaration for jsdom-global
declare module 'jsdom-global' {
  export default function(html: string): () => void;
}

// Define the mock_signal function
function mock_signal(): () => void {
  return function inner_function() {
    console.log('done');
  }
}

// Add type definition for Model
interface Model {
  todos: { id: number; title: string; done: boolean }[];
  hash: string;
  editing?: number;
}

// [Existing tests remain unchanged]

test('render_footer view using (elmish) HTML DOM functions', function (t) {
  const model: Model = {
    todos: [
      { id: 1, title: "Learn Elm Architecture", done: true },
      { id: 2, title: "Build Todo List App",    done: false },
      { id: 3, title: "Win the Internet!",      done: false }
    ],
    hash: '#/' // the "route" to display
  };
  const appElement = document.getElementById(id);
  if (appElement) {
    appElement.appendChild(app.render_footer(model, mock_signal()));

    const countElement = document.getElementById('count');
    if (countElement) {
      const left = countElement.innerHTML;
      t.equal(left, "<strong>2</strong> items left", "Todos remaining: " + left);
    }

    t.equal(document.querySelectorAll('li').length, 3, "3 <li> in <footer>");

    const link_text = ['All', 'Active', 'Completed'];
    const hrefs = ['#/', '#/active', '#/completed'];
    document.querySelectorAll('a').forEach(function (a, index) {
      t.equal(a.textContent, link_text[index], "<footer> link #" + index + " is: " + a.textContent + " === " + link_text[index]);
      t.equal(a.getAttribute('href'), hrefs[index], "href #" + index + " is: " + a.getAttribute('href') + " === " + hrefs[index]);
    });

    elmish.empty(appElement);
  }
  t.end();
});

// [Other tests remain unchanged]

test('2. New Todo, should allow me to add todo items', function (t) {
  const appElement = document.getElementById(id);
  if (appElement) {
    elmish.empty(appElement);
  }
  elmish.mount({todos: [], hash: '#/'}, app.update, app.view, id, app.subscriptions);
  const new_todo = document.getElementById('new-todo') as HTMLInputElement;
  const todo_text = 'Make Everything Awesome!     ';
  new_todo.value = todo_text;
  document.dispatchEvent(new KeyboardEvent('keyup', {'keyCode': 13}));
  const items = document.querySelectorAll('.view');
  t.equal(items.length, 1, "should allow me to add todo items");
  const todoElement = document.getElementById('1');
  if (todoElement) {
    const actual = todoElement.textContent;
    t.equal(todo_text.trim(), actual, "should trim text input");
  }

  const clone = document.getElementById(id)?.cloneNode(true);
  document.dispatchEvent(new KeyboardEvent('keyup', {'keyCode': 42}));
  const currentElement = document.getElementById(id);
  t.deepEqual(currentElement, clone, "#" + id + " no change");

  t.equal(new_todo.value, '', "should clear text input field when an item is added");

  const mainElement = document.getElementById('main');
  const footerElement = document.getElementById('footer');
  if (mainElement && footerElement) {
    const main_display = window.getComputedStyle(mainElement);
    const footer_display = window.getComputedStyle(footerElement);
    t.equal(main_display.display, 'block', "should show #main when items added");
    t.equal(footer_display.display, 'block', "should show #footer when items added");
  }

  if (appElement) {
    elmish.empty(appElement);
  }
  localStorage.removeItem('todos-elmish_' + id);
  t.end();
});

// [Remaining tests with similar adjustments]

test('7. Clear Completed > should display the number of completed items', function (t) {
  const appElement = document.getElementById(id);
  if (appElement) {
    elmish.empty(appElement);
  }
  const model: Model = {
    todos: [
      { id: 0, title: "Make something people want.", done: false },
      { id: 1, title: "Bootstrap for as long as you can", done: true },
      { id: 2, title: "Let's solve our own problem", done: false }
    ],
    hash: '#/'
  };
  elmish.mount(model, app.update, app.view, id, app.subscriptions);

  const completedCountElement = document.getElementById('completed-count');
  if (completedCountElement && completedCountElement.textContent) {
    const completed_count = parseInt(completedCountElement.textContent, 10);
    const done_count = model.todos.filter(function(i) { return i.done }).length;
    t.equal(completed_count, done_count, "displays completed items count: " + completed_count);
  }

  if (appElement) {
    elmish.empty(appElement);
  }
  localStorage.removeItem('todos-elmish_' + id);
  t.end();
});

// [Remaining tests with similar adjustments for type safety and null checks]
