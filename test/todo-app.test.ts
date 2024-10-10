import test from 'tape';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import jsdomGlobal from 'jsdom-global';
import * as app from '../lib/todo-app.js';
import * as elmish from '../lib/elmish.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8');

// Use jsdomGlobal as any to bypass type checking
(jsdomGlobal as any)(html);

const id = 'test-app';

interface Todo {
  id: number;
  title: string;
  done: boolean;
}

interface Model {
  todos: Todo[];
  hash: string;
}

// Type assertion for app.model
const appModel = app as unknown as { model: Model };

test('`model` (Object) has desired keys', function (t) {
  const keys = Object.keys(appModel.model);
  t.deepEqual(keys, ['todos', 'hash'], "`todos` and `hash` keys are present.");
  t.true(Array.isArray(appModel.model.todos), "model.todos is an Array")
  t.end();
});

test('`update` default case should return model unmodified', function (t) {
  const model = JSON.parse(JSON.stringify(appModel.model));
  const unmodified_model = app.update('UNKNOWN_ACTION', model);
  t.deepEqual(model, unmodified_model, "model returned unmodified");
  t.end();
});

test('update `ADD` a new todo item to model.todos Array', function (t) {
  const model = JSON.parse(JSON.stringify(appModel.model)); // initial state
  t.equal(model.todos.length, 0, "initial model.todos.length is 0");
  const updated_model = app.update('ADD', model, "Add Todo List Item");
  const expected = { id: 1, title: "Add Todo List Item", done: false };
  t.equal(updated_model.todos.length, 1, "updated_model.todos.length is 1");
  t.deepEqual(updated_model.todos[0], expected, "Todo list item added.");
  t.end();
});

test('update `TOGGLE` a todo item from done=false to done=true', function (t) {
  const model = JSON.parse(JSON.stringify(appModel.model)); // initial state
  const model_with_todo = app.update('ADD', model, "Toggle a todo list item");
  const item = model_with_todo.todos[0];
  const model_todo_done = app.update('TOGGLE', model_with_todo, item.id);
  const expected = { id: 1, title: "Toggle a todo list item", done: true };
  t.deepEqual(model_todo_done.todos[0], expected, "Todo list item Toggled.");
  t.end();
});

test('`TOGGLE` (undo) a todo item from done=true to done=false', function (t) {
  const model = JSON.parse(JSON.stringify(appModel.model)); // initial state
  const model_with_todo = app.update('ADD', model, "Toggle a todo list item");
  const item = model_with_todo.todos[0];
  const model_todo_done = app.update('TOGGLE', model_with_todo, item.id);
  const expected = { id: 1, title: "Toggle a todo list item", done: true };
  t.deepEqual(model_todo_done.todos[0], expected, "Toggled done=false >> true");
  // add another item before "undoing" the original one:
  const model_second_item = app.update('ADD', model_todo_done, "Another todo");
  t.equal(model_second_item.todos.length, 2, "there are TWO todo items");
  // Toggle the original item such that: done=true >> done=false
  const model_todo_undone = app.update('TOGGLE', model_second_item, item.id);
  const undone = { id: 1, title: "Toggle a todo list item", done: false };
  t.deepEqual(model_todo_undone.todos[0],undone, "Todo item Toggled > undone!");
  t.end();
});

// this is used for testing view functions which require a signal function
function mock_signal() {
  return function inner_function() {
    console.log('done');
  }
}

test('render_item HTML for a single Todo Item', function (t) {
  const model: Model = {
    todos: [
      { id: 1, title: "Learn Elm Architecture", done: true },
    ],
    hash: '#/'
  };
  const rootElement = document.getElementById(id);
  if (rootElement) {
    rootElement.appendChild(
      app.render_item(model.todos[0], model, mock_signal),
    );

    const doneElement = document.querySelectorAll('.completed')[0];
    t.equal(doneElement?.textContent, 'Learn Elm Architecture', 'Done: Learn "TEA"');

    const checkedElement = document.querySelectorAll('input')[0] as HTMLInputElement;
    t.equal(checkedElement?.checked, true, 'Done: ' + model.todos[0].title + " is done=true");

    elmish.empty(rootElement);
  }
  t.end();
});

test('render_item HTML without a valid signal function', function (t) {
  const model: Model = {
    todos: [
      { id: 1, title: "Learn Elm Architecture", done: true },
    ],
    hash: '#/' // the "route" to display
  };
  const rootElement = document.getElementById(id);
  if (rootElement) {
    rootElement.appendChild(
      app.render_item(model.todos[0], model, mock_signal),
    );

    const doneElement = document.querySelectorAll('.completed')[0];
    t.equal(doneElement?.textContent, 'Learn Elm Architecture', 'Done: Learn "TEA"');

    const checkedElement = document.querySelectorAll('input')[0] as HTMLInputElement;
    t.equal(checkedElement?.checked, true, 'Done: ' + model.todos[0].title + " is done=true");

    elmish.empty(rootElement);
  }
  t.end();
});

test('render_main "main" view using (elmish) HTML DOM functions', function (t) {
  const model: Model = {
    todos: [
      { id: 1, title: "Learn Elm Architecture", done: true },
      { id: 2, title: "Build Todo List App",    done: false },
      { id: 3, title: "Win the Internet!",      done: false }
    ],
    hash: '#/'
  };
  const rootElement = document.getElementById(id);
  if (rootElement) {
    rootElement.appendChild(app.render_main(model, mock_signal));
    document.querySelectorAll('.view').forEach(function (item, index) {
      t.equal(item.textContent, model.todos[index].title,
        "index #" + index + " <label> text: " + item.textContent)
    });
  }
  const inputs = document.querySelectorAll('input');
  [true, false, false].forEach(function(state, index){
    const input = inputs[index + 1] as HTMLInputElement;
    t.equal(input.checked, state,
      "Todo #" + index + " is done=" + state)
  })

  const clearElement = document.getElementById(id);
  if (clearElement) {
    elmish.empty(clearElement);
  }
  t.end();
});

test('render_footer view for 3 todo items', function (t) {
  const model: Model = {
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
    rootElement.appendChild(app.render_footer(model, mock_signal));

    // todo-count should display 2 items left (still to be done):
    const countElement = document.getElementById('count');
    const left = countElement?.innerHTML;
    t.equal(left, "<strong>2</strong> items left", "Todos remaining: " + left);

    // count number of footer <li> items:
    const footerItems = document.querySelectorAll('footer li');
    t.equal(footerItems.length, 4, "footer has 4 items");

    // check footer link text and href:
    const footerLinks = document.querySelectorAll('footer a');
    const linkText = ['All', 'Active', 'Completed'];
    const linkHrefs = ['#/', '#/active', '#/completed'];
    footerLinks.forEach(function (link, i) {
      t.equal(link.textContent, linkText[i], "Footer link #" + i + " is " + linkText[i]);
      t.equal(link.getAttribute('href'), linkHrefs[i],
        "Footer link #" + i + " href is " + linkHrefs[i]);
    });

    // check for "Clear completed" button
    const clearButton = document.querySelector('button.clear-completed') as HTMLButtonElement;
    const clear = clearButton?.textContent;
    t.equal(clear, 'Clear completed [1]',
      '<button> in <footer> "Clear completed [1]"');

    elmish.empty(rootElement); // clear DOM ready for next test
  }
  t.end();
});

test('render_footer view for 1 todo item (singular item left)', function (t) {
  const model: Model = {
    todos: [
      { id: 1, title: "Be excellent to each other!", done: false }
    ],
    hash: '#/' // the "route" to display
  };
  // render_footer view and append it to the DOM inside the `test-app` node:
  const rootElement = document.getElementById(id);
  if (rootElement) {
    rootElement.appendChild(app.render_footer(model, mock_signal));

    // todo-count should display "1 item left" (still to be done):
    const countElement = document.getElementById('count');
    const left = countElement?.innerHTML;
    t.equal(left, "<strong>1</strong> item left", "Todos remaining: " + left);

    elmish.empty(rootElement); // clear DOM ready for next test
  }
  t.end();
});

// Remaining tests...

test('3. Mark all as completed ("TOGGLE_ALL")', function (t) {
  const clearElement = document.getElementById(id);
  if (clearElement) {
    elmish.empty(clearElement);
  }
  localStorage.removeItem('todos-elmish_' + id);
  const model: Model = {
    todos: [
      { id: 1, title: "Learn Elm Architecture", done: true },
      { id: 2, title: "Build Todo List App", done: false },
      { id: 3, title: "Win the Internet!", done: false }
    ],
    hash: '#/'
  };
  elmish.mount(model, app.update, app.view, id, app.subscriptions);

  const items = document.querySelectorAll('.view');

  document.querySelectorAll('.toggle').forEach(function(item, index) {
    const toggleItem = item as HTMLInputElement;
    t.equal(toggleItem.checked, model.todos[index].done,
      "Todo #" + index + " is done=" + toggleItem.checked
      + " text: " + items[index].textContent)
  })

  const toggleAll = document.getElementById('toggle-all') as HTMLInputElement;
  toggleAll.click();
  document.querySelectorAll('.toggle').forEach(function(item) {
    const toggleItem = item as HTMLInputElement;
    t.equal(toggleItem.checked, true,
      "TOGGLE each Todo is done=" + toggleItem.checked)
  });
  t.equal(toggleAll.checked, true, "should allow me to mark all items as completed")

  toggleAll.click();
  document.querySelectorAll('.toggle').forEach(function(item) {
    const toggleItem = item as HTMLInputElement;
    t.equal(toggleItem.checked, false,
      "TOGGLE_ALL Todo is done=" + toggleItem.checked)
  });
  t.equal(toggleAll.checked, false, "should allow me to clear the completion state of all items")

  document.querySelectorAll('.toggle').forEach(function(item) {
    const toggleItem = item as HTMLInputElement;
    toggleItem.click();
    t.equal(toggleItem.checked, true,
      ".toggle.click() (each) Todo which is done=" + toggleItem.checked)
  });
  t.equal(toggleAll.checked, true, "complete all checkbox should update state when items are completed")

  const finalClearElement = document.getElementById(id);
  if (finalClearElement) {
    elmish.empty(finalClearElement);
  }
  localStorage.removeItem('todos-elmish_store');
  t.end();
});

test('4. Item: should allow me to mark items as complete', function (t) {
  const clearElement = document.getElementById(id);
  if (clearElement) {
    elmish.empty(clearElement);
  }
  localStorage.removeItem('todos-elmish_' + id);
  const model: Model = {
    todos: [
      { id: 0, title: "Make something people want", done: false }
    ],
    hash: '#/'
  };
  elmish.mount(model, app.update, app.view, id, app.subscriptions);
  const item = document.getElementById('0');
  if (item) {
    t.equal(item.textContent, model.todos[0].title, 'Item contained in model.');
  }
  const toggle = document.querySelectorAll('.toggle')[0] as HTMLInputElement;
  t.equal(toggle.checked, false, 'Item starts out "active" (done=false)');

  toggle.click();
  t.equal(toggle.checked, true, 'Item should allow me to mark items as complete');

  toggle.click();
  t.equal(toggle.checked, false, 'Item should allow me to un-mark items as complete');
  t.end();
});

test('4.1 DELETE item by clicking <button class="destroy">', function (t) {
  const clearElement = document.getElementById(id);
  if (clearElement) {
    elmish.empty(clearElement);
  }
  localStorage.removeItem('todos-elmish_' + id);
  const model: Model = {
    todos: [
      { id: 0, title: "Delete Me! (Click The X)", done: false }
    ],
    hash: '#/'
  };
  elmish.mount(model, app.update, app.view, id, app.subscriptions);
  t.equal(document.querySelectorAll('.destroy').length, 1, "one destroy button")

  const item = document.getElementById('0');
  if (item) {
    t.equal(item.textContent, model.todos[0].title, 'Item contained in DOM.');
    const button = item.querySelector('button.destroy');
    if (button instanceof HTMLButtonElement) {
      button.click();
    }
  }
  t.equal(document.querySelectorAll('.destroy').length, 0, "zero destroy buttons after click");
  t.end();
});

// Remaining tests...

test('5.3 [ENTER] Key in edit mode triggers SAVE action', function (t) {
  const clearElement = document.getElementById(id);
  if (clearElement) {
    elmish.empty(clearElement);
  }
  localStorage.removeItem('todos-elmish_' + id);
  const model: Model = {
    todos: [
      { id: 0, title: "Make something people want.", done: false }
    ],
    hash: '#/'
  };
  elmish.mount(model, app.update, app.view, id, app.subscriptions);

  // Double-click to enter edit mode
  const label = document.querySelectorAll('.view > label')[0] as HTMLLabelElement;
  label.click();
  label.click();

  // change the title
  const updated_title = "Do things that don\'t scale!  ";
  // apply the updated_title to the <input class="edit">:
  const editInput = document.querySelectorAll('.edit')[0] as HTMLInputElement;
  editInput.value = updated_title;
  // trigger the [Enter] keyboard key to ADD the new todo:
  document.dispatchEvent(new KeyboardEvent('keyup', {'keyCode': 13}));
  // confirm that the todo item title was updated to the updated_title:
  const updatedLabel = document.querySelectorAll('.view > label')[0] as HTMLLabelElement;
  t.equal(updatedLabel.textContent, updated_title.trim(),
    'todo item text updated to: ' + updated_title.trim());
  t.end();
});

test('5.4 SAVE should remove the item if an empty text string was entered',
  function (t) {
    const clearElement = document.getElementById(id);
    if (clearElement) {
      elmish.empty(clearElement);
    }
    localStorage.removeItem('todos-elmish_' + id);
    const model: Model = {
      todos: [
        { id: 0, title: "Make something people want.", done: false },
        { id: 1, title: "Let's solve our own problem", done: false }
      ],
      hash: '#/'
    };
    elmish.mount(model, app.update, app.view, id, app.subscriptions);
    t.equal(document.querySelectorAll('.view').length, 2, 'todo count: 2');

    // Double-click to enter edit mode
    const label = document.querySelectorAll('.view > label')[0] as HTMLLabelElement;
    label.click();
    label.click();

    // apply empty string to the <input class="edit">:
    const editInput = document.querySelectorAll('.edit')[0] as HTMLInputElement;
    editInput.value = '';
    // trigger the [Enter] keyboard key to ADD the new todo:
    document.dispatchEvent(new KeyboardEvent('keyup', {'keyCode': 13}));
    // confirm that the todo item was removed!
    t.equal(document.querySelectorAll('.view').length, 1, 'todo count: 1');
    t.end();
  });

test('5.5 CANCEL should cancel edits on escape', function (t) {
  const clearElement = document.getElementById(id);
  if (clearElement) {
    elmish.empty(clearElement);
  }
  localStorage.removeItem('todos-elmish_' + id);
  const model: Model = {
    todos: [
      { id: 0, title: "Make something people want.", done: false },
      { id: 1, title: "Let's solve our own problem", done: false }
    ],
    hash: '#/'
  };
  elmish.mount(model, app.update, app.view, id, app.subscriptions);
  t.equal(document.querySelectorAll('.view > label')[1].textContent,
    model.todos[1].title, 'todo id 1 has title: ' + model.todos[1].title);

  // Double-click to enter edit mode
  const label = document.querySelectorAll('.view > label')[1] as HTMLLabelElement;
  label.click();
  label.click();

  // apply new text to the <input class="edit">:
  const editInput = document.querySelectorAll('.edit')[0] as HTMLInputElement;
  editInput.value = 'Hello World';
  // trigger the [esc] keyboard key to CANCEL editing
  document.dispatchEvent(new KeyboardEvent('keyup', {'keyCode': 27}));
  // confirm the item.title is still the original title:
  const updatedLabel = document.querySelectorAll('.view > label')[1] as HTMLLabelElement;
  t.equal(updatedLabel.textContent, model.todos[1].title,
    'todo id 1 still has title: ' + model.todos[1].title);
  t.end();
});

// Remaining tests...

test('8. Persistence > should persist its data', function (t) {
  const clearElement = document.getElementById(id);
  if (clearElement) {
    elmish.empty(clearElement);
  }
  const model: Model = {
    todos: [
      { id: 0, title: "Make something people want.", done: false }
    ],
    hash: '#/'
  };
  // render the view and append it to the DOM inside the `test-app` node:
  elmish.mount(model, app.update, app.view, id, app.subscriptions);
  // confirm that the model is saved to localStorage
  t.equal(localStorage.getItem('todos-elmish_' + id),
    JSON.stringify(model), "data is persisted to localStorage");

  const finalClearElement = document.getElementById(id);
  if (finalClearElement) {
    elmish.empty(finalClearElement);
  }
  localStorage.removeItem('todos-elmish_' + id);
  t.end();
});

test('9. Routing > should allow me to display active/completed/all items',
  function (t) {
    const clearElement = document.getElementById(id);
    if (clearElement) {
      elmish.empty(clearElement);
    }
    localStorage.removeItem('todos-elmish_' + id);
    const model: Model = {
      todos: [
        { id: 0, title: "Make something people want.", done: false },
        { id: 1, title: "Bootstrap for as long as you can", done: false },
        { id: 2, title: "Let's solve our own problem", done: true }
      ],
      hash: '#/'
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, app.update, app.view, id, app.subscriptions);

    // 1. All Items:
    t.equal(document.querySelectorAll('.view').length, 3, "3 items in DOM");

    // 2. Active Items:
    const activeLink = document.querySelector('a[href="#/active"]') as HTMLAnchorElement;
    activeLink.click();
    t.equal(document.querySelectorAll('.view').length, 2, "2 active items");

    // 3. Completed Items:
    const completedLink = document.querySelector('a[href="#/completed"]') as HTMLAnchorElement;
    completedLink.click();
    t.equal(document.querySelectorAll('.view').length, 1, "1 completed item");

    const finalClearElement = document.getElementById(id);
    if (finalClearElement) {
      elmish.empty(finalClearElement);
    }
    localStorage.removeItem('todos-elmish_' + id);
    t.end();
});

// End of tests
