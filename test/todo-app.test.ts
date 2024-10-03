import test from 'tape';       // https://github.com/dwyl/learn-tape
import fs from 'fs';           // to read html files (see below)
import path from 'path';       // so we can open files cross-platform
import { Model, Todo } from '../lib/todo-app'; // Import the Model and Todo types
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'));
require('jsdom-global')(html);      // https://github.com/rstacruz/jsdom-global
import * as app from '../lib/todo-app'; // functions to test
import * as elmish from '../lib/elmish'; // import "elmish" core functions
const id = 'test-app';              // all tests use 'test-app' as root element

test('`model` (Object) has desired keys', function (t: test.Test) {
  const keys: string[] = Object.keys(app.initial_model);
  t.deepEqual(keys, ['todos', 'hash'], "`todos` and `hash` keys are present.");
  t.true(Array.isArray(app.initial_model.todos), "model.todos is an Array")
  t.end();
});

test('`update` default case should return model unmodified', function (t: test.Test) {
  const model: Model = JSON.parse(JSON.stringify(app.initial_model));
  const unmodified_model: Model = app.update('UNKNOWN_ACTION', model);
  t.deepEqual(model, unmodified_model, "model returned unmodified");
  t.end();
});

test('update `ADD` a new todo item to model.todos Array', function (t: test.Test) {
  const model: Model = JSON.parse(JSON.stringify(app.initial_model)); // initial state
  t.equal(model.todos.length, 0, "initial model.todos.length is 0");
  const updated_model: Model = app.update('ADD', model, "Add Todo List Item");
  const expected: Todo = { id: 1, title: "Add Todo List Item", done: false };
  t.equal(updated_model.todos.length, 1, "updated_model.todos.length is 1");
  t.deepEqual(updated_model.todos[0], expected, "Todo list item added.");
  t.end();
});

test('update `TOGGLE` a todo item from done=false to done=true', function (t: test.Test) {
  const model: Model = JSON.parse(JSON.stringify(app.initial_model)); // initial state
  const model_with_todo: Model = app.update('ADD', model, "Toggle a todo list item");
  const item: Todo = model_with_todo.todos[0];
  const model_todo_done: Model = app.update('TOGGLE', model_with_todo, item.id);
  const expected: Todo = { id: 1, title: "Toggle a todo list item", done: true };
  t.deepEqual(model_todo_done.todos[0], expected, "Todo list item Toggled.");
  t.end();
});

test('`TOGGLE` (undo) a todo item from done=true to done=false', function (t: test.Test) {
  const model: Model = JSON.parse(JSON.stringify(app.initial_model)); // initial state
  const model_with_todo: Model = app.update('ADD', model, "Toggle a todo list item");
  const item: Todo = model_with_todo.todos[0];
  const model_todo_done: Model = app.update('TOGGLE', model_with_todo, item.id);
  const expected: Todo = { id: 1, title: "Toggle a todo list item", done: true };
  t.deepEqual(model_todo_done.todos[0], expected, "Toggled done=false >> true");
  // add another item before "undoing" the original one:
  const model_second_item: Model = app.update('ADD', model_todo_done, "Another todo");
  t.equal(model_second_item.todos.length, 2, "there are TWO todo items");
  // Toggle the original item such that: done=true >> done=false
  const model_todo_undone: Model = app.update('TOGGLE', model_second_item, item.id);
  const undone: Todo = { id: 1, title: "Toggle a todo list item", done: false };
  t.deepEqual(model_todo_undone.todos[0],undone, "Todo item Toggled > undone!");
  t.end();
});

// this is used for testing view functions which require a signal function
function mock_signal (): () => void {
  return function inner_function(): void {
    console.log('done');
  }
}

test('render_item HTML for a single Todo Item', function (t: test.Test) {
  const model = {
    todos: [
      { id: 1, title: "Learn Elm Architecture", done: true },
    ],
    hash: '#/', // the "route" to display
    all_done: false
  };
  // render the ONE todo list item:
  const rootElement = document.getElementById(id);
  if (rootElement) {
    rootElement.appendChild(
      app.render_item(model.todos[0], model, mock_signal) as HTMLElement,
    );

    const doneElement = document.querySelector('.completed');
    if (doneElement) {
      const done = doneElement.textContent;
      t.equal(done, 'Learn Elm Architecture', 'Done: Learn "TEA"');
    }

    const inputElement = document.querySelector('input') as HTMLInputElement;
    if (inputElement) {
      const checked = inputElement.checked;
      t.equal(checked, true, 'Done: ' + model.todos[0].title + " is done=true");
    }

    elmish.emptyNode(rootElement); // clear DOM ready for next test
  }
  t.end();
});

test('render_item HTML without a valid signal function', function (t: test.Test) {
  const model = {
    todos: [
      { id: 1, title: "Learn Elm Architecture", done: true },
    ],
    hash: '#/', // the "route" to display
    all_done: false
  };
  // render the ONE todo list item:
  const rootElement = document.getElementById(id);
  if (rootElement) {
    rootElement.appendChild(
      app.render_item(model.todos[0], model, () => {}) as HTMLElement,
    );

    const doneElement = document.querySelector('.completed');
    if (doneElement) {
      const done = doneElement.textContent;
      t.equal(done, 'Learn Elm Architecture', 'Done: Learn "TEA"');
    }

    const inputElement = document.querySelector('input') as HTMLInputElement;
    if (inputElement) {
      const checked = inputElement.checked;
      t.equal(checked, true, 'Done: ' + model.todos[0].title + " is done=true");
    }

    elmish.emptyNode(rootElement); // clear DOM ready for next test
  }
  t.end();
});

test('render_main "main" view using (elmish) HTML DOM functions', function (t: test.Test) {
  const model = {
    todos: [
      { id: 1, title: "Learn Elm Architecture", done: true },
      { id: 2, title: "Build Todo List App",    done: false },
      { id: 3, title: "Win the Internet!",      done: false }
    ],
    hash: '#/', // the "route" to display
    all_done: false
  };
  // render the "main" view and append it to the DOM inside the `test-app` node:
  const rootElement = document.getElementById(id);
  if (rootElement) {
    rootElement.appendChild(app.render_main(model, mock_signal) as HTMLElement);
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
    elmish.emptyNode(rootElement); // clear DOM ready for next test
  }
  t.end();
});

test('render_footer view using (elmish) HTML DOM functions', function (t: test.Test) {
  const model = {
    todos: [
      { id: 1, title: "Learn Elm Architecture", done: true },
      { id: 2, title: "Build Todo List App",    done: false },
      { id: 3, title: "Win the Internet!",      done: false }
    ],
    hash: '#/', // the "route" to display
    all_done: false
  };
  // render_footer view and append it to the DOM inside the `test-app` node:
  const rootElement = document.getElementById(id);
  if (rootElement) {
    rootElement.appendChild(app.render_footer(model, () => {}));

    // todo-count should display 2 items left (still to be done):
    const countElement = document.getElementById('count');
    if (countElement) {
      const left = countElement.innerHTML;
      t.equal(left, "<strong>2</strong> items left", "Todos remaining: " + left);
    }

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
    const clearCompletedElement = document.querySelector('.clear-completed');
    if (clearCompletedElement) {
      const clear = clearCompletedElement.textContent;
      t.equal(clear, 'Clear completed [1]',
        '<button> in <footer> "Clear completed [1]"');
    }

    elmish.emptyNode(rootElement); // clear DOM ready for next test
  }
  t.end();
});

test('render_footer 1 item left (pluarisation test)', function (t: test.Test) {
  const model = {
    todos: [
      { id: 1, title: "Be excellent to each other!", done: false }
    ],
    hash: '#/', // the "route" to display
    all_done: false
  };
  // render_footer view and append it to the DOM inside the `test-app` node:
  const rootElement = document.getElementById(id);
  if (rootElement) {
    rootElement.appendChild(app.render_footer(model, () => {}));

    // todo-count should display "1 item left" (still to be done):
    const countElement = document.getElementById('count');
    if (countElement) {
      const left = countElement.innerHTML;
      t.equal(left, "<strong>1</strong> item left", "Todos remaining: " + left);
    }

    elmish.empty(rootElement); // clear DOM ready for next test
  }
  t.end();
});

test('view renders the whole todo app using "partials"', function (t) {
  // render the view and append it to the DOM inside the `test-app` node:
  const model: Model = {
    todos: [],
    hash: '#/',
    all_done: false
  };
  const rootElement = document.getElementById(id);
  if (rootElement) {
    const view = app.view(model, mock_signal) as HTMLElement;
    rootElement.appendChild(view);
  }

  const h1Element = document.querySelectorAll('h1')[0];
  if (h1Element) {
    t.equal(h1Element.textContent, "todos", "<h1>todos");
  }
  // placeholder:
  const newTodoElement = document.getElementById('new-todo');
  if (newTodoElement) {
    const placeholder = newTodoElement.getAttribute("placeholder");
    t.equal(placeholder, "What needs to be done?", "paceholder set on <input>");
  }

  // todo-count should display 0 items left (based on initial_model):
  const countElement = document.getElementById('count');
  if (countElement) {
    const left = countElement.innerHTML;
    t.equal(left, "<strong>0</strong> items left", "Todos remaining: " + left);
  }

  elmish.empty(document.getElementById(id) as HTMLElement); // clear DOM ready for next test
  t.end();
});

test('1. No Todos, should hide #footer and #main', function (t) {
  // render the view and append it to the DOM inside the `test-app` node:
  const rootElement = document.getElementById(id);
  if (rootElement) {
    const model: Model = { todos: [], hash: '#/', all_done: false };
    rootElement.appendChild(app.view(model, () => {}) as HTMLElement); // No Todos

    const mainElement = document.getElementById('main');
    if (mainElement) {
      const main_display = window.getComputedStyle(mainElement);
      t.equal(main_display.display, 'none', "No Todos, hide #main");
    }

    const footerElement = document.getElementById('footer');
    if (footerElement) {
      const main_footer = window.getComputedStyle(footerElement);
      t.equal(main_footer.display, 'none', "No Todos, hide #footer");
    }

    elmish.empty(rootElement); // clear DOM ready for next test
  }
  t.end();
});

// Testing localStorage requires "polyfil" because:a
// https://github.com/jsdom/jsdom/issues/1137 ¯\_(ツ)_/¯
// globals are usually bad! but a "necessary evil" here.
global.localStorage = global.localStorage ? global.localStorage : {
  getItem: function(key: string): string | null {
   const value = this[key as keyof typeof this];
   return typeof value === 'undefined' ? null : String(value);
 },
 setItem: function (key: string, value: string): void {
   this[key as keyof typeof this] = value;
 },
 removeItem: function (key: string): void {
   delete this[key as keyof typeof this];
 },
 clear: function(): void {
   Object.keys(this).forEach(key => delete this[key as keyof typeof this]);
 },
 key: function(index: number): string | null {
   return Object.keys(this)[index] || null;
 },
 length: 0
} as Storage;
localStorage.removeItem('todos-elmish_store');

test('2. New Todo, should allow me to add todo items', function (t) {
  const rootElement = document.getElementById(id);
  if (rootElement) elmish.empty(rootElement);
  // render the view and append it to the DOM inside the `test-app` node:
  elmish.mount({todos: [], hash: '#/', all_done: false} as app.Model, app.update, app.view as (model: app.Model, signal: Function) => HTMLElement, id, app.subscriptions);
  const new_todo = document.getElementById('new-todo') as HTMLInputElement | null;
  // "type" content in the <input id="new-todo">:
  const todo_text = 'Make Everything Awesome!     '; // deliberate whitespace!
  if (new_todo) {
    new_todo.value = todo_text;
  }
  // trigger the [Enter] keyboard key to ADD the new todo:
  document.dispatchEvent(new KeyboardEvent('keyup', {'keyCode': 13}));
  const items = document.querySelectorAll('.view');
  t.equal(items.length, 1, "should allow me to add todo items");
  // check if the new todo was added to the DOM:
  const element = document.getElementById('1');
  const actual = element ? element.textContent : null;
  t.equal(todo_text.trim(), actual, "should trim text input")

  // subscription keyCode trigger "branch" test (should NOT fire the signal):
  const cloneElement = document.getElementById(id);
  const clone = cloneElement ? cloneElement.cloneNode(true) : null;
  document.dispatchEvent(new KeyboardEvent('keyup', {'keyCode': 42}));
  t.deepEqual(document.getElementById(id), clone, "#" + id + " no change");

  // check that the <input id="new-todo"> was reset after the new item was added
  if (new_todo) {
    t.equal(new_todo.value, '',
      "should clear text input field when an item is added")
  }

  const mainElement = document.getElementById('main');
  const main_display = mainElement ? window.getComputedStyle(mainElement) : null;
  t.equal('block', main_display?.display,
    "should show #main and #footer when items added");
  const footerElement = document.getElementById('footer');
  const main_footer = footerElement ? window.getComputedStyle(footerElement) : null;
  t.equal('block', main_footer?.display, "item added, show #footer");

  if (rootElement) elmish.empty(rootElement); // clear DOM ready for next test
  localStorage.removeItem('todos-elmish_' + id);
  t.end();
});

test('3. Mark all as completed ("TOGGLE_ALL")', function (t) {
  const rootElement = document.getElementById(id);
  if (rootElement) elmish.empty(rootElement);
  localStorage.removeItem('todos-elmish_' + id);
  const model: app.Model = {
    todos: [
      { id: 0, title: "Learn Elm Architecture", done: true },
      { id: 1, title: "Build Todo List App",    done: false },
      { id: 2, title: "Win the Internet!",      done: false }
    ],
    hash: '#/', // the "route" to display
    all_done: false
  };
  // render the view and append it to the DOM inside the `test-app` node:
  elmish.mount(model, app.update, app.view as (model: app.Model, signal: Function) => HTMLElement, id, app.subscriptions);
  // confirm that the ONLY the first todo item is done=true:
  const items = document.querySelectorAll('.view');

  document.querySelectorAll('.toggle').forEach(function(item, index) {
    const checkbox = item as HTMLInputElement;
    t.equal(checkbox.checked, model.todos[index].done,
      "Todo #" + index + " is done=" + checkbox.checked
      + " text: " + items[index].textContent)
  })

  // click the toggle-all checkbox to trigger TOGGLE_ALL: >> true
  const toggleAll = document.getElementById('toggle-all') as HTMLInputElement;
  if (toggleAll) toggleAll.click(); // click toggle-all checkbox
  document.querySelectorAll('.toggle').forEach(function(item, index) {
    const checkbox = item as HTMLInputElement;
    t.equal(checkbox.checked, true,
      "TOGGLE each Todo #" + index + " is done=" + checkbox.checked
      + " text: " + items[index].textContent)
  });
  t.equal(toggleAll?.checked, true,
    "should allow me to mark all items as completed")


  // click the toggle-all checkbox to TOGGLE_ALL (again!) true >> false
  if (toggleAll) toggleAll.click(); // click toggle-all checkbox
  document.querySelectorAll('.toggle').forEach(function(item, index) {
    const checkbox = item as HTMLInputElement;
    t.equal(checkbox.checked, false,
      "TOGGLE_ALL Todo #" + index + " is done=" + checkbox.checked
      + " text: " + items[index].textContent)
  })
  t.equal(toggleAll?.checked, false,
    "should allow me to clear the completion state of all items")

  // *manually* "click" each todo item:
  document.querySelectorAll('.toggle').forEach(function(item, index) {
    const checkbox = item as HTMLInputElement;
    checkbox.click(); // this should "toggle" the todo checkbox to done=true
    t.equal(checkbox.checked, true,
      ".toggle.click() (each) Todo #" + index + " which is done=" + checkbox.checked
      + " text: " + items[index].textContent)
  });
  // the toggle-all checkbox should be "checked" as all todos are done=true!
  t.equal(toggleAll?.checked, true,
    "complete all checkbox should update state when items are completed")

  if (rootElement) elmish.empty(rootElement); // clear DOM ready for next test
  localStorage.removeItem('todos-elmish_store');
  t.end();
});

test('4. Item: should allow me to mark items as complete', function (t) {
  const rootElement = document.getElementById(id);
  if (rootElement) elmish.empty(rootElement);
  localStorage.removeItem('todos-elmish_' + id);
  const model: app.Model = {
    todos: [
      { id: 0, title: "Make something people want.", done: false }
    ],
    hash: '#/', // the "route" to display
    all_done: false
  };
  // render the view and append it to the DOM inside the `test-app` node:
  elmish.mount(model, app.update, app.view, id, app.subscriptions);
  const item = document.getElementById('0')
  t.equal(item?.textContent, model.todos[0].title, 'Item contained in model.');
  // confirm that the todo item is NOT done (done=false):
  const checkbox = document.querySelectorAll('.toggle')[0] as HTMLInputElement;
  t.equal(checkbox.checked, false,
  'Item starts out "active" (done=false)');


  // click the checkbox to toggle it to done=true
  const toggleElement = document.querySelectorAll('.toggle')[0] as HTMLElement;
  toggleElement.click();
  t.equal((document.querySelectorAll('.toggle')[0] as HTMLInputElement).checked, true,
  'Item should allow me to mark items as complete');

  // click the checkbox to toggle it to done=false "undo"
  toggleElement.click();
  t.equal((document.querySelectorAll('.toggle')[0] as HTMLInputElement).checked, false,
  'Item should allow me to un-mark items as complete');
  t.end();
});

test('4.1 DELETE item by clicking <button class="destroy">', function (t) {
  const rootElement = document.getElementById(id);
  if (rootElement) elmish.empty(rootElement);
  localStorage.removeItem('todos-elmish_' + id);
  const model: app.Model = {
    todos: [
      { id: 0, title: "Make something people want.", done: false }
    ],
    hash: '#/', // the "route" to display
    all_done: false
  };
  // render the view and append it to the DOM inside the `test-app` node:
  elmish.mount(model, app.update, app.view, id, app.subscriptions);
  // const todo_count = ;
  t.equal(document.querySelectorAll('.destroy').length, 1, "one destroy button")

  const item = document.getElementById('0');
  if (item) {
    t.equal(item.textContent, model.todos[0].title, 'Item contained in DOM.');
    // DELETE the item by clicking on the <button class="destroy">:
    const button = item.querySelectorAll('button.destroy')[0] as HTMLElement;
    button.click();
  }
  // confirm that there is no loger a <button class="destroy">
  t.equal(document.querySelectorAll('button.destroy').length, 0,
    'there is no loger a <button class="destroy"> as the only item was DELETEd')
  t.equal(document.getElementById('0'), null, 'todo item successfully DELETEd');
  t.end();
});

test('5.1 Editing: > Render an item in "editing mode"', function (t) {
  const rootElement = document.getElementById(id);
  if (rootElement) elmish.empty(rootElement);
  localStorage.removeItem('todos-elmish_' + id);
  const model: app.Model = {
    todos: [
      { id: 0, title: "Make something people want.", done: false },
      { id: 1, title: "Bootstrap for as long as you can", done: false },
      { id: 2, title: "Let's solve our own problem", done: false }
    ],
    hash: '#/', // the "route" to display
    editing: 2, // edit the 3rd todo list item (which has id == 2)
    all_done: false
  };
  // render the ONE todo list item in "editing mode" based on model.editing:
  const container = document.getElementById(id);
  if (container) {
    container.appendChild(
      app.render_item(model.todos[2], model, mock_signal),
    );
  }
  // test that signal (in case of the test mock_signal) is onclick attribute:
  const label = document.querySelectorAll('.view > label')[0] as HTMLElement;
  t.equal(label.onclick?.toString(),
    mock_signal().toString(), "mock_signal is onclick attribute of label");

  // test that the <li class="editing"> and <input class="edit"> was rendered:
  t.equal(document.querySelectorAll('.editing').length, 1,
    "<li class='editing'> element is visible");
  t.equal(document.querySelectorAll('.edit').length, 1,
    "<input class='edit'> element is visible");
  const editInput = document.querySelectorAll('.edit')[0] as HTMLInputElement;
  t.equal(editInput.value, model.todos[2].title,
    "<input class='edit'> has value: " + model.todos[2].title);
  t.end();
});

test('5.2 Double-click an item <label> to edit it', function (t) {
  const rootElement = document.getElementById(id);
  if (rootElement) elmish.empty(rootElement);
  localStorage.removeItem('todos-elmish_' + id);
  const model: app.Model = {
    todos: [
      { id: 0, title: "Make something people want.", done: false },
      { id: 1, title: "Let's solve our own problem", done: false }
    ],
    hash: '#/', // the "route" to display
    all_done: false
  };
  // render the view and append it to the DOM inside the `test-app` node:
  elmish.mount(model, app.update, app.view as (model: app.Model, signal: Function) => HTMLElement, id, app.subscriptions);
  const label = document.querySelectorAll('.view > label')[1] as HTMLElement;
  // "double-click" i.e. click the <label> twice in quick succession:
  label.click();
  label.click();
  // confirm that we are now in editing mode:
  t.equal(document.querySelectorAll('.editing').length, 1,
    "<li class='editing'> element is visible");
  const editInput = document.querySelectorAll('.edit')[0] as HTMLInputElement;
  if (editInput) {
    t.equal(editInput.value, model.todos[1].title,
      "<input class='edit'> has value: " + model.todos[1].title);
  }
  t.end();
});

test('5.2.2 Slow clicks do not count as double-click > no edit!', function (t) {
  const rootElement = document.getElementById(id);
  if (rootElement) elmish.empty(rootElement);
  localStorage.removeItem('todos-elmish_' + id);
  const model: app.Model = {
    todos: [
      { id: 0, title: "Make something people want.", done: false },
      { id: 1, title: "Let's solve our own problem", done: false }
    ],
    hash: '#/', // the "route" to display
    all_done: false
  };
  // render the view and append it to the DOM inside the `test-app` node:
  elmish.mount(model, app.update, app.view as (model: app.Model, signal: Function) => HTMLElement, id, app.subscriptions);
  const label = document.querySelectorAll('.view > label')[1] as HTMLElement;
  // "double-click" i.e. click the <label> twice in quick succession:
  if (label) {
    label.click();
    setTimeout(function (){
      label.click();
      // confirm that we are now in editing mode:
      t.equal(document.querySelectorAll('.editing').length, 0,
        "<li class='editing'> element is NOT visible");
      t.end();
    }, 301)
  }
});

test('5.3 [ENTER] Key in edit mode triggers SAVE action', function (t) {
  const rootElement = document.getElementById(id);
  if (rootElement) elmish.empty(rootElement);
  localStorage.removeItem('todos-elmish_' + id);
  const model: app.Model = {
    todos: [
      { id: 0, title: "Make something people want.", done: false },
      { id: 1, title: "Let's solve our own problem", done: false }
    ],
    hash: '#/', // the "route" to display
    editing: 1, // edit the 3rd todo list item (which has id == 2)
    all_done: false
  };
  // render the view and append it to the DOM inside the `test-app` node:
  elmish.mount(model, app.update, app.view, id, app.subscriptions);
  // change the
  const updated_title = "Do things that don\'t scale!  "
  // apply the updated_title to the <input class="edit">:
  const editInput = document.querySelectorAll('.edit')[0] as HTMLInputElement;
  if (editInput) editInput.value = updated_title;
  // trigger the [Enter] keyboard key to ADD the new todo:
  document.dispatchEvent(new KeyboardEvent('keyup', {'keyCode': 13}));
  // confirm that the todo item title was updated to the updated_title:
  const label = document.querySelectorAll('.view > label')[1].textContent;
  t.equal(label, updated_title.trim(),
      "item title updated to:" + updated_title + ' (trimmed)');
  t.end();
});

test('5.4 SAVE should remove the item if an empty text string was entered',
  function (t) {
  const rootElement = document.getElementById(id);
  if (rootElement) elmish.empty(rootElement);
  localStorage.removeItem('todos-elmish_' + id);
  const model: app.Model = {
    todos: [
      { id: 0, title: "Make something people want.", done: false },
      { id: 1, title: "Let's solve our own problem", done: false }
    ],
    hash: '#/', // the "route" to display
    editing: 1, // edit the 3rd todo list item (which has id == 2)
    all_done: false
  };
  // render the view and append it to the DOM inside the `test-app` node:
  elmish.mount(model, app.update, app.view as (model: app.Model, signal: Function) => HTMLElement, id, app.subscriptions);
  t.equal(document.querySelectorAll('.view').length, 2, 'todo count: 2');
  // apply empty string to the <input class="edit">:
  const editInput = document.querySelectorAll('.edit')[0] as HTMLInputElement;
  if (editInput) {
    editInput.value = '';
    // trigger the [Enter] keyboard key to ADD the new todo:
    document.dispatchEvent(new KeyboardEvent('keyup', {'keyCode': 13}));
    // confirm that the todo item was removed!
    t.equal(document.querySelectorAll('.view').length, 1, 'todo count: 1');
  }
  t.end();
});

test('5.5 CANCEL should cancel edits on escape', function (t) {
  const rootElement = document.getElementById(id);
  if (rootElement) elmish.empty(rootElement);
  localStorage.removeItem('todos-elmish_' + id);
  const model: app.Model = {
    todos: [
      { id: 0, title: "Make something people want.", done: false },
      { id: 1, title: "Let's solve our own problem", done: false }
    ],
    hash: '#/', // the "route" to display
    editing: 1, // edit the 3rd todo list item (which has id == 2)
    all_done: false
  };
  // render the view and append it to the DOM inside the `test-app` node:
  elmish.mount(model, app.update, app.view as (model: app.Model, signal: Function) => HTMLElement, id, app.subscriptions);
  const label = document.querySelectorAll('.view > label')[1];
  if (label) {
    t.equal(label.textContent,
      model.todos[1].title, 'todo id 1 has title: ' + model.todos[1].title);
  }
  // apply empty string to the <input class="edit">:
  const editInput = document.querySelectorAll('.edit')[0] as HTMLInputElement;
  if (editInput) {
    editInput.value = 'Hello World';
    // trigger the [esc] keyboard key to CANCEL editing
    document.dispatchEvent(new KeyboardEvent('keyup', {'keyCode': 27}));
  }
  // confirm the item.title is still the original title:
  t.equal(document.querySelectorAll('.view > label')[1].textContent,
      model.todos[1].title, 'todo id 1 has title: ' + model.todos[1].title);
  localStorage.removeItem('todos-elmish_' + id);
  t.end();
});

test('6. Counter > should display the current number of todo items',
  function (t) {
  const rootElement = document.getElementById(id);
  if (rootElement) elmish.empty(rootElement);
  const model: app.Model = {
    todos: [
      { id: 0, title: "Make something people want.", done: false },
      { id: 1, title: "Bootstrap for as long as you can", done: false },
      { id: 2, title: "Let's solve our own problem", done: false }
    ],
    hash: '#/',
    all_done: false
  };
  // render the view and append it to the DOM inside the `test-app` node:
  elmish.mount(model, app.update, app.view as (model: app.Model, signal: Function) => HTMLElement, id, app.subscriptions);
  // count:
  const countElement = document.getElementById('count');
  const count = countElement ? parseInt(countElement.textContent || '0', 10) : 0;
  t.equal(count, model.todos.length, "displays todo item count: " + count);

  const clearElement = document.getElementById(id);
  if (clearElement) elmish.empty(clearElement); // clear DOM ready for next test
  localStorage.removeItem('todos-elmish_' + id);
  t.end();
});

test('7. Clear Completed > should display the number of completed items',
  function (t) {
  const rootElement = document.getElementById(id);
  if (rootElement) elmish.empty(rootElement);
  const model: app.Model = {
    todos: [
      { id: 0, title: "Make something people want.", done: false },
      { id: 1, title: "Bootstrap for as long as you can", done: true },
      { id: 2, title: "Let's solve our own problem", done: true }
    ],
    hash: '#/',
    all_done: false
  };
  // render the view and append it to the DOM inside the `test-app` node:
  elmish.mount(model, app.update, app.view as (model: app.Model, signal: Function) => HTMLElement, id, app.subscriptions);
  // count todo items in DOM:
  t.equal(document.querySelectorAll('.view').length, 3,
    "at the start, there are 3 todo items in the DOM.");

  // count completed items
  const completedCountElement = document.getElementById('completed-count');
  const completed_count = completedCountElement ? parseInt(completedCountElement.textContent || '0', 10) : 0;
  const done_count = model.todos.filter(function(i) {return i.done }).length;
  t.equal(completed_count, done_count,
    "displays completed items count: " + completed_count);

  // clear completed items:
  const button = document.querySelectorAll('.clear-completed')[0] as HTMLElement;
  if (button) {
    button.click();
  }

  // confirm that there is now only ONE todo list item in the DOM:
  t.equal(document.querySelectorAll('.view').length, 1,
    "after clearing completed items, there is only 1 todo item in the DOM.");

  // no clear completed button in the DOM when there are no "done" todo items:
  t.equal(document.querySelectorAll('clear-completed').length, 0,
    'no clear-completed button when there are no done items.')

  const clearElement = document.getElementById(id);
  if (clearElement) elmish.empty(clearElement); // clear DOM ready for next test
  localStorage.removeItem('todos-elmish_' + id);
  t.end();
});

test('8. Persistence > should persist its data', function (t) {
  const rootElement = document.getElementById(id);
  if (rootElement) elmish.empty(rootElement);
  const model: app.Model = {
    todos: [
      { id: 0, title: "Make something people want.", done: false }
    ],
    hash: '#/',
    all_done: false
  };
  // render the view and append it to the DOM inside the `test-app` node:
  elmish.mount(model, app.update, app.view as (model: app.Model, signal: Function) => HTMLElement, id, app.subscriptions);
  // confirm that the model is saved to localStorage
  // console.log('localStorage', localStorage.getItem('todos-elmish_' + id));
  t.equal(localStorage.getItem('todos-elmish_' + id),
    JSON.stringify(model), "data is persisted to localStorage");

  const clearElement = document.getElementById(id);
  if (clearElement) elmish.empty(clearElement); // clear DOM ready for next test
  localStorage.removeItem('todos-elmish_' + id);
  t.end();
});

test('9. Routing > should allow me to display active/completed/all items',
  function (t) {
  localStorage.removeItem('todos-elmish_' + id);
  const rootElement = document.getElementById(id);
  if (rootElement) elmish.empty(rootElement);
  const model: app.Model = {
    todos: [
      { id: 0, title: "Make something people want.", done: false },
      { id: 1, title: "Bootstrap for as long as you can", done: true },
      { id: 2, title: "Let's solve our own problem", done: true }
    ],
    hash: '#/active', // ONLY ACTIVE items
    all_done: false
  };
  // render the view and append it to the DOM inside the `test-app` node:
  elmish.mount(model, app.update, app.view as (model: app.Model, signal: Function) => HTMLElement, id, app.subscriptions);
  const mod = app.update('ROUTE', model);
  // t.equal(mod.hash, '#/', 'default route is #/');

  t.equal(document.querySelectorAll('.view').length, 1, "one active item");
  let selected = document.querySelectorAll('.selected')[0]
  t.equal(selected.id, 'active', "active footer filter is selected");

  // empty:
  const clearElement1 = document.getElementById(id);
  if (clearElement1) elmish.empty(clearElement1);
  localStorage.removeItem('todos-elmish_' + id);
  // show COMPLTED items:
  model.hash = '#/completed';
  model.all_done = false;
  elmish.mount(model, app.update, app.view as (model: app.Model, signal: Function) => HTMLElement, id, app.subscriptions);
  t.equal(document.querySelectorAll('.view').length, 2,
    "two completed items");
  selected = document.querySelectorAll('.selected')[0]
  t.equal(selected.id, 'completed', "completed footer filter is selected");

  // empty:
  const clearElement2 = document.getElementById(id);
  if (clearElement2) elmish.empty(clearElement2);
  localStorage.removeItem('todos-elmish_' + id);
  // show ALL items:
  model.hash = '#/';
  model.all_done = false;
  elmish.mount(model, app.update, app.view as (model: app.Model, signal: Function) => HTMLElement, id, app.subscriptions);
  t.equal(document.querySelectorAll('.view').length, 3,
    "three items total");
  selected = document.querySelectorAll('.selected')[0]
  t.equal(selected.id, 'all', "all footer filter is selected");

  const clearElement3 = document.getElementById(id);
  if (clearElement3) elmish.empty(clearElement3); // clear DOM ready for next test
  localStorage.removeItem('todos-elmish_' + id);
  t.end();
});
