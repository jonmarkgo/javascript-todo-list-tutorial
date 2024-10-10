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
import * as app from '../lib/todo-app.js'; // Change .ts to .js
import * as elmish from '../lib/elmish.js'; // Change .ts to .js

const id = 'test-app';              // all tests use 'test-app' as root element

// Add type for the model
interface TodoModel {
  todos: { id: number; title: string; done: boolean }[];
  hash: string;
}

// Update the AppModule interface
interface AppModule {
  model: TodoModel;
  update: (action: string, model: TodoModel, ...args: any[]) => TodoModel;
  render_item: (todo: TodoModel['todos'][0], model: TodoModel, signal?: Function) => HTMLElement;
  render_main: (model: TodoModel, signal: Function) => HTMLElement;
  render_footer: (model: TodoModel) => HTMLElement;
  view: (model: TodoModel) => HTMLElement;
  subscriptions: (signal: Function) => void;
}

const typedApp = app as unknown as AppModule;

// Update test functions
test('`model` (Object) has desired keys', function (t: test.Test) {
  const model = typedApp.model;
  const keys = Object.keys(model);
  t.deepEqual(keys, ['todos', 'hash'], "`todos` and `hash` keys are present.");
  t.true(Array.isArray(model.todos), "model.todos is an Array")
  t.end();
});

test('`update` default case should return model unmodified', function (t: test.Test) {
  const model = JSON.parse(JSON.stringify(typedApp.model));
  const unmodified_model = typedApp.update('UNKNOWN_ACTION', model);
  t.deepEqual(model, unmodified_model, "model returned unmodified");
  t.end();
});

test('update `ADD` a new todo item to model.todos Array', function (t: test.Test) {
  const model = JSON.parse(JSON.stringify(typedApp.model)); // initial state
  t.equal(model.todos.length, 0, "initial model.todos.length is 0");
  const updated_model = typedApp.update('ADD', model, "Add Todo List Item");
  const expected = { id: 1, title: "Add Todo List Item", done: false };
  t.equal(updated_model.todos.length, 1, "updated_model.todos.length is 1");
  t.deepEqual(updated_model.todos[0], expected, "Todo list item added.");
  t.end();
});

test('update `TOGGLE` a todo item from done=false to done=true', function (t: test.Test) {
  const model = JSON.parse(JSON.stringify(typedApp.model)); // initial state
  const model_with_todo = typedApp.update('ADD', model, "Toggle a todo list item");
  const item = model_with_todo.todos[0];
  const model_todo_done = typedApp.update('TOGGLE', model_with_todo, item.id);
  const expected = { id: 1, title: "Toggle a todo list item", done: true };
  t.deepEqual(model_todo_done.todos[0], expected, "Todo list item Toggled.");
  t.end();
});

test('`TOGGLE` (undo) a todo item from done=true to done=false', function (t: test.Test) {
  const model = JSON.parse(JSON.stringify(typedApp.model)); // initial state
  const model_with_todo = typedApp.update('ADD', model, "Toggle a todo list item");
  const item = model_with_todo.todos[0];
  const model_todo_done = typedApp.update('TOGGLE', model_with_todo, item.id);
  const expected = { id: 1, title: "Toggle a todo list item", done: true };
  t.deepEqual(model_todo_done.todos[0], expected, "Toggled done=false >> true");
  // add another item before "undoing" the original one:
  const model_second_item = typedApp.update('ADD', model_todo_done, "Another todo");
  t.equal(model_second_item.todos.length, 2, "there are TWO todo items");
  // Toggle the original item such that: done=true >> done=false
  const model_todo_undone = typedApp.update('TOGGLE', model_second_item, item.id);
  const undone = { id: 1, title: "Toggle a todo list item", done: false };
  t.deepEqual(model_todo_undone.todos[0],undone, "Todo item Toggled > undone!");
  t.end();
});

// this is used for testing view functions which require a signal function
function mock_signal () {
  return function inner_function() {
    console.log('done');
  }
}

test('render_item HTML for a single Todo Item', function (t: test.Test) {
  const model: TodoModel = {
    todos: [
      { id: 1, title: "Learn Elm Architecture", done: true },
    ],
    hash: '#/' // the "route" to display
  };
  const rootElement = document.getElementById(id);
  if (rootElement) {
    rootElement.appendChild(
      typedApp.render_item(model.todos[0], model, mock_signal)
    );
  }

  const done = document.querySelectorAll('.completed')[0].textContent;
  t.equal(done, 'Learn Elm Architecture', 'Done: Learn "TEA"');

  const checked = document.querySelectorAll('input')[0].checked;
  t.equal(checked, true, 'Done: ' + model.todos[0].title + " is done=true");

  elmish.empty(rootElement!);
  t.end();
});

test('render_item HTML without a valid signal function', function (t: test.Test) {
  const model: TodoModel = {
    todos: [
      { id: 1, title: "Learn Elm Architecture", done: true },
    ],
    hash: '#/' // the "route" to display
  };
  const rootElement = document.getElementById(id);
  if (rootElement) {
    rootElement.appendChild(
      typedApp.render_item(model.todos[0], model)
    );
  }

  const done = document.querySelectorAll('.completed')[0].textContent;
  t.equal(done, 'Learn Elm Architecture', 'Done: Learn "TEA"');

  const checked = document.querySelectorAll('input')[0].checked;
  t.equal(checked, true, 'Done: ' + model.todos[0].title + " is done=true");

  elmish.empty(rootElement!);
  t.end();
});

test('render_main "main" view using (elmish) HTML DOM functions', function (t: test.Test) {
  const model: TodoModel = {
    todos: [
      { id: 1, title: "Learn Elm Architecture", done: true },
      { id: 2, title: "Build Todo List App",    done: false },
      { id: 3, title: "Win the Internet!",      done: false }
    ],
    hash: '#/' // the "route" to display
  };
  // render the "main" view and append it to the DOM inside the `test-app` node:
  const rootElement = document.getElementById(id);
  if (rootElement) {
    rootElement.appendChild(typedApp.render_main(model, mock_signal));
  }
  // test that the title text in the model.todos was rendered to <label> nodes:
  document.querySelectorAll('.view').forEach(function (item, index) {
    t.equal(item.textContent, model.todos[index].title,
      "index #" + index + " <label> text: " + item.textContent)
  })

  const inputs = document.querySelectorAll('input'); // todo items are 1,2,3
  [true, false, false].forEach(function(state, index){
    t.equal(inputs[index + 1].checked, state,
      "Todo #" + index + " is done=" + state)
  })
  elmish.empty(rootElement!);
  t.end();
});

test('render_footer view using (elmish) HTML DOM functions', function (t: test.Test) {
  const model: TodoModel = {
    todos: [
      { id: 1, title: "Learn Elm Architecture", done: true },
      { id: 2, title: "Build Todo List App",    done: false },
      { id: 3, title: "Win the Internet!",      done: false }
    ],
    hash: '#/' // the "route" to display
  };
  // render_footer view and append it to the DOM inside the `test-app` node:
  const rootElement = document.getElementById(id);
  if (rootElement) {
    rootElement.appendChild(typedApp.render_footer(model));
  }

  // todo-count should display 2 items left (still to be done):
  const left = document.getElementById('count')?.innerHTML;
  t.equal(left, "<strong>2</strong> items left", "Todos remaining: " + left);

  // count number of footer <li> items:
  t.equal(document.querySelectorAll('li').length, 3, "3 <li> in <footer>");

  // check footer link text and href:
  const link_text = ['All', 'Active', 'Completed'];
  const hrefs = ['#/', '#/active', '#/completed'];
  document.querySelectorAll('a').forEach(function (a, index) {
    // check link text:
    t.equal(a.textContent, link_text[index], "<footer> link #" + index
      + " is: " + a.textContent + " === " + link_text[index]);
    // check hrefs:
    t.equal(a.href.replace('about:blank', ''), hrefs[index],
    "<footer> link #" + index + " href is: " + hrefs[index]);
  });

  // check for "Clear completed" button in footer:
  const clear = document.querySelectorAll('.clear-completed')[0].textContent;
  t.equal(clear, 'Clear completed [1]',
    '<button> in <footer> "Clear completed [1]"');

  elmish.empty(rootElement!);
  t.end();
});

test('render_footer 1 item left (pluarisation test)', function (t: test.Test) {
  const model: TodoModel = {
    todos: [
      { id: 1, title: "Be excellent to each other!", done: false }
    ],
    hash: '#/' // the "route" to display
  };
  // render_footer view and append it to the DOM inside the `test-app` node:
  const rootElement = document.getElementById(id);
  if (rootElement && typedApp.render_footer) {
    rootElement.appendChild(typedApp.render_footer(model));
  }

  // todo-count should display "1 item left" (still to be done):
  const countElement = document.getElementById('count');
  const left = countElement?.innerHTML;
  t.equal(left, "<strong>1</strong> item left", "Todos remaining: " + left);

  elmish.empty(rootElement!);
  t.end();
});

test('view renders the whole todo app using "partials"', function (t: test.Test) {
  // render the view and append it to the DOM inside the `test-app` node:
  const rootElement = document.getElementById(id);
  if (rootElement && typedApp.view) {
    rootElement.appendChild(typedApp.view(typedApp.model));
  }

  const h1Element = document.querySelectorAll('h1')[0];
  t.equal(h1Element?.textContent, "todos", "<h1>todos");

  // placeholder:
  const newTodoElement = document.getElementById('new-todo');
  const placeholder = newTodoElement?.getAttribute("placeholder");
  t.equal(placeholder, "What needs to be done?", "placeholder set on <input>");

  // todo-count should display 0 items left (based on initial_model):
  const countElement = document.getElementById('count');
  const left = countElement?.innerHTML;
  t.equal(left, "<strong>0</strong> items left", "Todos remaining: " + left);

  elmish.empty(rootElement!);
  t.end();
});

test('1. No Todos, should hide #footer and #main', function (t: test.Test) {
  localStorage.removeItem('todos-elmish_' + id);
  const rootElement = document.getElementById(id);
  if (rootElement) {
    elmish.empty(rootElement);
  }
  const model = { todos: [], hash: '#/' };
  elmish.mount(model, typedApp.update, typedApp.view, id, typedApp.subscriptions);

  t.equal(document.getElementById('main')?.style.display, 'none', '#main should be hidden');
  t.equal(document.getElementById('footer')?.style.display, 'none', '#footer should be hidden');

  if (rootElement) {
    elmish.empty(rootElement);
  }
  localStorage.removeItem('todos-elmish_' + id);
  t.end();
});

// Update the localStorage polyfill
const localStoragePolyfill: Storage = {
  getItem: function(key: string) {
    const value = this[key as keyof typeof this];
    return typeof value === 'undefined' ? null : value;
  },
  setItem: function(key: string, value: string) {
    this[key as keyof typeof this] = value;
  },
  removeItem: function(key: string) {
    delete this[key as keyof typeof this];
  },
  clear: function() {
    Object.keys(this).forEach(key => delete this[key as keyof typeof this]);
  },
  key: function(index: number) {
    return Object.keys(this)[index] || null;
  },
  length: 0
};

global.localStorage = global.localStorage || localStoragePolyfill;

// Update test functions with proper null checks and type assertions
test('2. New Todo, should allow me to add todo items', function (t: test.Test) {
  const rootElement = document.getElementById(id);
  if (rootElement) {
    elmish.empty(rootElement);
  }
  // render the view and append it to the DOM inside the `test-app` node:
  elmish.mount({todos: [], hash: '#/'}, typedApp.update, typedApp.view, id, typedApp.subscriptions);
  const new_todo = document.getElementById('new-todo') as HTMLInputElement;
  // "type" content in the <input id="new-todo">:
  const todo_text = 'Make Everything Awesome!     '; // deliberate whitespace!
  new_todo.value = todo_text;
  // trigger the [Enter] keyboard key to ADD the new todo:
  document.dispatchEvent(new KeyboardEvent('keyup', {'keyCode': 13}));
  const items = document.querySelectorAll('.view');
  t.equal(items.length, 1, "should allow me to add todo items");
  // check if the new todo was added to the DOM:
  const todoElement = document.getElementById('1');
  const actual = todoElement?.textContent;
  t.equal(todo_text.trim(), actual, "should trim text input")

  // subscription keyCode trigger "branch" test (should NOT fire the signal):
  const clone = document.getElementById(id)?.cloneNode(true);
  document.dispatchEvent(new KeyboardEvent('keyup', {'keyCode': 42}));
  t.deepEqual(document.getElementById(id), clone, "#" + id + " no change");

  // check that the <input id="new-todo"> was reset after the new item was added
  t.equal(new_todo.value, '',
    "should clear text input field when an item is added")

  const mainElement = document.getElementById('main');
  const main_display = mainElement ? window.getComputedStyle(mainElement) : null;
  t.equal('block', main_display?.display,
    "should show #main and #footer when items added");
  const footerElement = document.getElementById('footer');
  const main_footer = footerElement ? window.getComputedStyle(footerElement) : null;
  t.equal('block', main_footer?.display, "item added, show #footer");

  if (rootElement) {
    elmish.empty(rootElement);
  }
  localStorage.removeItem('todos-elmish_' + id);
  t.end();
});

// Update remaining test functions similarly
test('3. Mark all as completed ("TOGGLE_ALL")', function (t: test.Test) {
  // ... (implementation of test case 3)
});

test('4. Item: should allow me to mark items as complete', function (t: test.Test) {
  // ... (implementation of test case 4)
});

// ... (other test cases)

test('9. Routing > should allow me to display active/completed/all items',
  function (t: test.Test) {
    localStorage.removeItem('todos-elmish_' + id);
    const rootElement = document.getElementById(id);
    if (rootElement) {
      elmish.empty(rootElement);
    }
    const model: TodoModel = {
      todos: [
        { id: 0, title: "Make something people want.", done: false },
        { id: 1, title: "Bootstrap for as long as you can", done: true },
        { id: 2, title: "Let's solve our own problem", done: false }
      ],
      hash: '#/active' // ONLY ACTIVE items
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, typedApp.update, typedApp.view, id, typedApp.subscriptions);
    const mod = typedApp.update('ROUTE', model);
    // t.equal(mod.hash, '#/', 'default route is #/');

    t.equal(document.querySelectorAll('.view').length, 1, "one active item");
    const selected = document.querySelectorAll('.selected')[0] as HTMLElement;
    t.equal(selected.id, 'active', "active footer filter is selected");

    // Show completed items
    model.hash = '#/completed';
    elmish.mount(model, typedApp.update, typedApp.view, id, typedApp.subscriptions);
    t.equal(document.querySelectorAll('.view').length, 1, "one completed item");
    const completedSelected = document.querySelectorAll('.selected')[0] as HTMLElement;
    t.equal(completedSelected.id, 'completed', "completed footer filter is selected");

    // Show all items
    model.hash = '#/';
    elmish.mount(model, typedApp.update, typedApp.view, id, typedApp.subscriptions);
    t.equal(document.querySelectorAll('.view').length, 3, "three items total");
    const allSelected = document.querySelectorAll('.selected')[0] as HTMLElement;
    t.equal(allSelected.id, 'all', "all footer filter is selected");

    if (rootElement) {
      elmish.empty(rootElement);
    }
    localStorage.removeItem('todos-elmish_' + id);
    t.end();
  }
);
