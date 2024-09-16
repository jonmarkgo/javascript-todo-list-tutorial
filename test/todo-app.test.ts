import test, { Test } from 'tape';
import * as fs from 'fs';
import * as path from 'path';
import jsdomGlobal from 'jsdom-global';
import * as app from '../lib/todo-app';
import * as elmish from '../lib/elmish';
import { TodoModel, TodoItem } from '../types';
import { LocalStorage } from 'node-localstorage';

const html: string = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8');
const cleanup = jsdomGlobal(html);

// Initialize LocalStorage before running tests
global.localStorage = new LocalStorage('./scratch');

const id: string = 'test-app';  // all tests use 'test-app' as root element

test('`model` (Object) has desired keys', (t) => {
  const keys = Object.keys(app.model);
  t.deepEqual(keys, ['todos', 'hash'], "All expected keys are present.");
  t.true(Array.isArray(app.model.todos), "model.todos is an Array");
  t.end();
});

test('`update` default case should return model unmodified', (t) => {
  const model = JSON.parse(JSON.stringify(app.model)) as TodoModel;
  const unmodified_model = app.update('UNKNOWN_ACTION', model, '');
  t.deepEqual(model, unmodified_model, "model returned unmodified");
  t.end();
});

test('update `ADD` a new todo item to model.todos Array', (t) => {
  const model = JSON.parse(JSON.stringify(app.model)) as TodoModel; // initial state
  t.equal(model.todos.length, 0, "initial model.todos.length is 0");
  const updated_model = app.update('ADD', model, "Add Todo List Item");
  const expected: TodoItem = { id: 1, title: "Add Todo List Item", done: false };
  t.equal(updated_model.todos.length, 1, "updated_model.todos.length is 1");
  t.deepEqual(updated_model.todos[0], expected, "Todo list item added.");
  t.end();
});

test('update `TOGGLE` a todo item from done=false to done=true', function (t) {
  const model = JSON.parse(JSON.stringify(app.model)); // initial state
  const model_with_todo = app.update('ADD', model, "Toggle a todo list item");
  const item = model_with_todo.todos[0];
  const model_todo_done = app.update('TOGGLE', model_with_todo, item.id);
  const expected = { id: 1, title: "Toggle a todo list item", done: true };
  t.deepEqual(model_todo_done.todos[0], expected, "Todo list item Toggled.");
  t.end();
});

test('`TOGGLE` (undo) a todo item from done=true to done=false', (t: Test) => {
  const model = JSON.parse(JSON.stringify(app.model)) as TodoModel; // initial state
  const model_with_todo = app.update('ADD', model, "Toggle a todo list item");
  const item = model_with_todo.todos[0];
  const model_todo_done = app.update('TOGGLE', model_with_todo, item.id);
  const expected: TodoItem = { id: 1, title: "Toggle a todo list item", done: true };
  t.deepEqual(model_todo_done.todos[0], expected, "Toggled done=false >> true");
  // add another item before "undoing" the original one:
  const model_second_item = app.update('ADD', model_todo_done, "Another todo");
  t.equal(model_second_item.todos.length, 2, "there are TWO todo items");
  // Toggle the original item such that: done=true >> done=false
  const model_todo_undone = app.update('TOGGLE', model_second_item, item.id);
  const undone: TodoItem = { id: 1, title: "Toggle a todo list item", done: false };
  t.deepEqual(model_todo_undone.todos[0], undone, "Todo item Toggled > undone!");
  t.end();
});

// this is used for testing view functions which require a signal function
function mock_signal(): () => void {
  return function inner_function(): void {
    console.log('done');
  }
}

test('render_item HTML for a single Todo Item', function (t) {
  const model = {
    todos: [
      { id: 1, title: "Learn Elm Architecture", done: true },
    ],
    hash: '#/' // the "route" to display
  };
  // render the ONE todo list item:
  const container = document.getElementById(id);
  if (container) {
    container.appendChild(
      app.render_item(model.todos[0], model, mock_signal),
    );
  } else {
    t.fail('Container element not found');
    return t.end();
  }

  const done = document.querySelectorAll('.completed')[0]?.textContent;
  t.equal(done, 'Learn Elm Architecture', 'Done: Learn "TEA"');

  const checked = document.querySelectorAll('input')[0].checked;
  t.equal(checked, true, 'Done: ' + model.todos[0].title + " is done=true");

  const element = document.getElementById(id);
  if (element) elmish.empty(element); // clear DOM ready for next test
  t.end();
});

test('render_item HTML without a valid signal function', function (t) {
  const model = {
    todos: [
      { id: 1, title: "Learn Elm Architecture", done: true },
    ],
    hash: '#/' // the "route" to display
  };
  // render the ONE todo list item:
  const container = document.getElementById(id);
  if (container) {
    container.appendChild(
      app.render_item(model.todos[0], model, undefined)
    );
  }

  const done = document.querySelectorAll('.completed')[0]?.textContent;
  t.equal(done, 'Learn Elm Architecture', 'Done: Learn "TEA"');

  const checked = document.querySelectorAll('input')[0].checked;
  t.equal(checked, true, 'Done: ' + model.todos[0].title + " is done=true");

  const element = document.getElementById(id);
  if (element) elmish.empty(element); // clear DOM ready for next test
  t.end();
});

test('render_main "main" view using (elmish) HTML DOM functions', function (t) {
  const model = {
    todos: [
      { id: 1, title: "Learn Elm Architecture", done: true },
      { id: 2, title: "Build Todo List App",    done: false },
      { id: 3, title: "Win the Internet!",      done: false }
    ],
    hash: '#/' // the "route" to display
  };
  // render the "main" view and append it to the DOM inside the `test-app` node:
  const testAppElement = document.getElementById(id);
  if (testAppElement) {
    testAppElement.appendChild(app.render_main(model, mock_signal));
    // test that the title text in the model.todos was rendered to <label> nodes:
    document.querySelectorAll('.view').forEach(function (item, index) {
      t.equal(item.textContent, model.todos[index].title,
        "index #" + index + " <label> text: " + item.textContent)
    })
  } else {
    t.fail(`Element with id '${id}' not found`);
  }

  const inputs = document.querySelectorAll('input'); // todo items are 1,2,3
  [true, false, false].forEach(function(state, index){
    t.equal(inputs[index + 1].checked, state,
      "Todo #" + index + " is done=" + state)
  })
  const element = document.getElementById(id);
  if (element) elmish.empty(element); // clear DOM ready for next test
  t.end();
});

test('render_footer view using (elmish) HTML DOM functions', function (t) {
  const model = {
    todos: [
      { id: 1, title: "Learn Elm Architecture", done: true },
      { id: 2, title: "Build Todo List App",    done: false },
      { id: 3, title: "Win the Internet!",      done: false }
    ],
    hash: '#/' // the "route" to display
  };
  // render_footer view and append it to the DOM inside the `test-app` node:
  const testAppElement = document.getElementById(id);
  if (testAppElement) {
    testAppElement.appendChild(app.render_footer(model, mock_signal));
  }

  // todo-count should display 2 items left (still to be done):
  const countElement = document.getElementById('count');
  const left = countElement ? countElement.innerHTML : '';
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

  const element = document.getElementById(id);
  if (element) elmish.empty(element); // clear DOM ready for next test
  t.end();
});

test('render_footer 1 item left (pluarisation test)', function (t) {
  const model = {
    todos: [
      { id: 1, title: "Be excellent to each other!", done: false }
    ],
    hash: '#/' // the "route" to display
  };
  // render_footer view and append it to the DOM inside the `test-app` node:
  const container = document.getElementById(id);
  if (container) {
    container.appendChild(app.render_footer(model, mock_signal));
  } else {
    t.fail('Container element not found');
    return t.end();
  }

  // todo-count should display "1 item left" (still to be done):
  const countElement = document.getElementById('count');
  const left = countElement ? countElement.innerHTML : '';
  t.equal(left, "<strong>1</strong> item left", "Todos remaining: " + left);

  const element = document.getElementById(id);
  if (element) elmish.empty(element); // clear DOM ready for next test
  t.end();
});

test('view renders the whole todo app using "partials"', function (t) {
  // render the view and append it to the DOM inside the `test-app` node:
  const container = document.getElementById(id);
  if (container) {
    container.appendChild(app.view(app.model, mock_signal));
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

  elmish.empty(document.getElementById(id) as HTMLElement); // clear DOM ready for next test
  t.end();
});

test('1. No Todos, should hide #footer and #main', function (t) {
  // render the view and append it to the DOM inside the `test-app` node:
  const container = document.getElementById(id);
  if (container) {
    container.appendChild(app.view({ todos: [], hash: '#/' }, () => {})); // No Todos
  }

  const mainElement = document.getElementById('main');
  if (mainElement) {
    const main_display = window.getComputedStyle(mainElement);
    t.equal(main_display.display, 'none', "No Todos, hide #main");
  } else {
    t.fail('Main element not found');
  }

  const footerElement = document.getElementById('footer');
  if (footerElement) {
    const main_footer = window.getComputedStyle(footerElement);
    t.equal(main_footer.display, 'none', "No Todos, hide #footer");
  } else {
    t.fail('Footer element not found');
  }

  const element = document.getElementById(id);
  if (element) elmish.empty(element); // clear DOM ready for next test
  t.end();
});

// Testing localStorage is handled by the declarations in declarations.d.ts
// The polyfill is no longer needed as we're using TypeScript declarations

localStorage.removeItem('todos-elmish_store');

test('2. New Todo, should allow me to add todo items', function (t) {
  const testAppElement = document.getElementById(id);
  if (testAppElement) {
    elmish.empty(testAppElement);
  }
  // render the view and append it to the DOM inside the `test-app` node:
  const initialModel: TodoModel = { todos: [], hash: '#/' };
  elmish.mount(initialModel, app.update, app.view, id, app.subscriptions);
  const new_todo = document.getElementById('new-todo') as HTMLInputElement | null;
  if (new_todo) {
    // "type" content in the <input id="new-todo">:
    const todo_text = 'Make Everything Awesome!     '; // deliberate whitespace!
    new_todo.value = todo_text;
    // trigger the [Enter] keyboard key to ADD the new todo:
    new_todo.dispatchEvent(new KeyboardEvent('keyup', {'key': 'Enter'}));

    // Wait for the DOM to update
    setTimeout(() => {
      const items = document.querySelectorAll('.view');
      t.equal(items.length, 1, "should allow me to add todo items");

      // check if the new todo was added to the DOM:
      const todoElement = document.querySelector('.todo-list li');
      if (todoElement) {
        const actual = todoElement.textContent?.trim();
        t.equal(todo_text.trim(), actual, "should trim text input");
      } else {
        t.fail('Todo item not found in DOM');
      }

      // check that the <input id="new-todo"> was reset after the new item was added
      t.equal(new_todo.value, '', "should clear text input field when an item is added");

      const mainElement = document.getElementById('main');
      const footerElement = document.getElementById('footer');

      if (mainElement) {
        const main_display = window.getComputedStyle(mainElement);
        t.equal(main_display.display, 'block', "should show #main when items added");
      } else {
        t.fail('Main element not found');
      }

      if (footerElement) {
        const footer_display = window.getComputedStyle(footerElement);
        t.equal(footer_display.display, 'block', "item added, show #footer");
      } else {
        t.fail('Footer element not found');
      }

      elmish.empty(document.getElementById(id) as HTMLElement); // clear DOM ready for next test
      localStorage.removeItem('todos-elmish_' + id);
      t.end();
    }, 0);
  } else {
    t.fail('New todo input element not found');
    t.end();
  }
});

test('3. Mark all as completed ("TOGGLE_ALL")', function (t) {
  const testAppElement = document.getElementById(id);
  if (testAppElement) {
    elmish.empty(testAppElement);
  }
  localStorage.removeItem('todos-elmish_' + id);
  const model: TodoModel = {
    todos: [
      { id: 0, title: "Learn Elm Architecture", done: true },
      { id: 1, title: "Build Todo List App",    done: false },
      { id: 2, title: "Win the Internet!",      done: false }
    ],
    hash: '#/' // the "route" to display
  };
  // render the view and append it to the DOM inside the `test-app` node:
  elmish.mount(model, app.update, app.view, id, app.subscriptions);
  // confirm that the ONLY the first todo item is done=true:
  const items = document.querySelectorAll('.view');

  document.querySelectorAll('.toggle').forEach(function(item, index) {
    if (item instanceof HTMLInputElement) {
      t.equal(item.checked, model.todos[index].done,
        "Todo #" + index + " is done=" + item.checked
        + " text: " + items[index].textContent)
    }
  })

  // click the toggle-all checkbox to trigger TOGGLE_ALL: >> true
  const toggleAllElement = document.getElementById('toggle-all');
  if (toggleAllElement instanceof HTMLInputElement) {
    toggleAllElement.click(); // click toggle-all checkbox
    document.querySelectorAll('.toggle').forEach(function(item, index) {
      if (item instanceof HTMLInputElement) {
        t.equal(item.checked, true,
          "TOGGLE each Todo #" + index + " is done=" + item.checked
          + " text: " + items[index].textContent)
      }
    });
    t.equal(toggleAllElement.checked, true,
      "should allow me to mark all items as completed")
  } else {
    t.fail('Toggle all checkbox not found');
  }


  // click the toggle-all checkbox to TOGGLE_ALL (again!) true >> false
  const toggleAllElementAgain = document.getElementById('toggle-all');
  if (toggleAllElementAgain instanceof HTMLInputElement) {
    toggleAllElementAgain.click(); // click toggle-all checkbox
    document.querySelectorAll('.toggle').forEach(function(item) {
      if (item instanceof HTMLInputElement) {
        t.equal(item.checked, false,
          "TOGGLE_ALL Todo is done=" + item.checked
          + " text: " + item.parentElement?.textContent)
      }
    });
    t.equal(toggleAllElementAgain.checked, false,
      "should allow me to clear the completion state of all items")
  } else {
    t.fail('Toggle all checkbox not found');
  }

  // *manually* "click" each todo item:
  document.querySelectorAll('.toggle').forEach(function(item) {
    if (item instanceof HTMLInputElement) {
      item.click(); // this should "toggle" the todo checkbox to done=true
      t.equal(item.checked, true,
        `.toggle.click() (each) Todo which is done=${item.checked} text: ${item.parentElement?.textContent}`);
    }
  });
  // the toggle-all checkbox should be "checked" as all todos are done=true!
  const toggleAllCheckbox = document.getElementById('toggle-all');
  if (toggleAllCheckbox instanceof HTMLInputElement) {
    t.equal(toggleAllCheckbox.checked, true,
      "complete all checkbox should update state when items are completed");
  }

  elmish.empty(document.getElementById(id) as HTMLElement); // clear DOM ready for next test
  localStorage.removeItem('todos-elmish_store');
  t.end();
});

test('4. Item: should allow me to mark items as complete', function (t) {
  elmish.empty(document.getElementById(id) as HTMLElement);
  localStorage.removeItem('todos-elmish_' + id);
  const model: TodoModel = {
    todos: [
      { id: 0, title: "Make something people want.", done: false }
    ],
    hash: '#/' // the "route" to display
  };
  // render the view and append it to the DOM inside the `test-app` node:
  elmish.mount(model, app.update, app.view, id, app.subscriptions);
  const item = document.getElementById('0');
  if (item) {
    t.equal(item.textContent, model.todos[0].title, 'Item contained in model.');
  } else {
    t.fail('Item not found in DOM');
  }
  // confirm that the todo item is NOT done (done=false):
  const toggleElement = document.querySelectorAll('.toggle')[0] as HTMLInputElement;
  t.equal(toggleElement.checked, false, 'Item starts out "active" (done=false)');

  // click the checkbox to toggle it to done=true
  toggleElement.click();
  t.equal(toggleElement.checked, true, 'Item should allow me to mark items as complete');

  // click the checkbox to toggle it to done=false "undo"
  toggleElement.click();
  t.equal(toggleElement.checked, false, 'Item should allow me to un-mark items as complete');
  t.end();
});

test('4.1 DELETE item by clicking <button class="destroy">', function (t) {
  elmish.empty(document.getElementById(id) as HTMLElement);
  localStorage.removeItem('todos-elmish_' + id);
  const model: TodoModel = {
    todos: [
      { id: 0, title: "Make something people want.", done: false }
    ],
    hash: '#/' // the "route" to display
  };
  // render the view and append it to the DOM inside the `test-app` node:
  elmish.mount(model, app.update, app.view, id, app.subscriptions);
  t.equal(document.querySelectorAll('.destroy').length, 1, "one destroy button")

  const item = document.getElementById('0');
  if (item) {
    t.equal(item.textContent, model.todos[0].title, 'Item contained in DOM.');
    // DELETE the item by clicking on the <button class="destroy">:
    const button = item.querySelector('button.destroy');
    if (button instanceof HTMLButtonElement) {
      button.click();
      // confirm that there is no longer a <button class="destroy">
      t.equal(document.querySelectorAll('button.destroy').length, 0,
        'there is no longer a <button class="destroy"> as the only item was DELETEd');
      t.equal(document.getElementById('0'), null, 'todo item successfully DELETEd');
    } else {
      t.fail('Destroy button not found');
    }
  } else {
    t.fail('Todo item not found');
  }
  t.end();
});

test('5.1 Editing: > Render an item in "editing mode"', function (t) {
  elmish.empty(document.getElementById(id) as HTMLElement);
  localStorage.removeItem('todos-elmish_' + id);
  const model = {
    todos: [
      { id: 0, title: "Make something people want.", done: false },
      { id: 1, title: "Bootstrap for as long as you can", done: false },
      { id: 2, title: "Let's solve our own problem", done: false }
    ],
    hash: '#/', // the "route" to display
    editing: 2 // edit the 3rd todo list item (which has id == 2)
  };
  // render the ONE todo list item in "editing mode" based on model.editing:
  const container = document.getElementById(id);
  if (container) {
    container.appendChild(
      app.render_item(model.todos[2], model, mock_signal),
    );
    // test that signal (in case of the test mock_signal) is onclick attribute:
    const label = document.querySelectorAll('.view > label')[0] as HTMLLabelElement;
    t.equal(label.onclick?.toString(),
      mock_signal().toString(), "mock_signal is onclick attribute of label");
  } else {
    t.fail('Container element not found');
  }

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
  elmish.empty(document.getElementById(id) as HTMLElement);
  localStorage.removeItem('todos-elmish_' + id);
  const model = {
    todos: [
      { id: 0, title: "Make something people want.", done: false },
      { id: 1, title: "Let's solve our own problem", done: false }
    ],
    hash: '#/' // the "route" to display
  };
  // render the view and append it to the DOM inside the `test-app` node:
  elmish.mount(model, app.update, app.view, id, app.subscriptions);
  const label = document.querySelectorAll('.view > label')[1] as HTMLLabelElement;
  // "double-click" i.e. click the <label> twice in quick succession:
  if (label) {
    label.click();
    label.click();
    // confirm that we are now in editing mode:
    t.equal(document.querySelectorAll('.editing').length, 1,
      "<li class='editing'> element is visible");
    const editInput = document.querySelectorAll('.edit')[0] as HTMLInputElement;
    if (editInput) {
      t.equal(editInput.value, model.todos[1].title,
        "<input class='edit'> has value: " + model.todos[1].title);
    } else {
      t.fail('Edit input not found');
    }
  } else {
    t.fail('Label element not found');
  }
  t.end();
});

test('5.2.2 Slow clicks do not count as double-click > no edit!', function (t) {
  const element = document.getElementById(id);
  if (element) elmish.empty(element);
  localStorage.removeItem('todos-elmish_' + id);
  const model = {
    todos: [
      { id: 0, title: "Make something people want.", done: false },
      { id: 1, title: "Let's solve our own problem", done: false }
    ],
    hash: '#/' // the "route" to display
  };
  // render the view and append it to the DOM inside the `test-app` node:
  elmish.mount(model, app.update, app.view, id, app.subscriptions);
  const label = document.querySelectorAll('.view > label')[1] as HTMLLabelElement;
  // "double-click" i.e. click the <label> twice in quick succession:
  label.click();
  setTimeout(function (){
    label.click();
    // confirm that we are not in editing mode:
    t.equal(document.querySelectorAll('.editing').length, 0,
      "<li class='editing'> element is NOT visible");
    t.end();
  }, 301)
});

test('5.3 [ENTER] Key in edit mode triggers SAVE action', function (t) {
  elmish.empty(document.getElementById(id) as HTMLElement);
  localStorage.removeItem('todos-elmish_' + id);
  const model = {
    todos: [
      { id: 0, title: "Make something people want.", done: false },
      { id: 1, title: "Let's solve our own problem", done: false }
    ],
    hash: '#/', // the "route" to display
    editing: 1 // edit the 3rd todo list item (which has id == 2)
  };
  // render the view and append it to the DOM inside the `test-app` node:
  elmish.mount(model, app.update, app.view, id, app.subscriptions);
  // change the
  const updated_title = "Do things that don\'t scale!  "
  // apply the updated_title to the <input class="edit">:
  const editInput = document.querySelectorAll('.edit')[0] as HTMLInputElement;
  if (editInput) {
    editInput.value = updated_title;
    // trigger the [Enter] keyboard key to ADD the new todo:
    document.dispatchEvent(new KeyboardEvent('keyup', {'key': 'Enter'}));
    // confirm that the todo item title was updated to the updated_title:
    const labelElement = document.querySelectorAll('.view > label')[1];
    if (labelElement) {
      const label = labelElement.textContent;
      t.equal(label, updated_title.trim(),
          "item title updated to:" + updated_title + ' (trimmed)');
    } else {
      t.fail('Label element not found');
    }
  } else {
    t.fail('Edit input element not found');
  }
  t.end();
});

test('5.4 SAVE should remove the item if an empty text string was entered',
  function (t) {
  const element = document.getElementById(id);
  if (element) elmish.empty(element);
  localStorage.removeItem('todos-elmish_' + id);
  const model = {
    todos: [
      { id: 0, title: "Make something people want.", done: false },
      { id: 1, title: "Let's solve our own problem", done: false }
    ],
    hash: '#/', // the "route" to display
    editing: 1 // edit the 3rd todo list item (which has id == 2)
  };
  // render the view and append it to the DOM inside the `test-app` node:
  elmish.mount(model, app.update, app.view, id, app.subscriptions);
  t.equal(document.querySelectorAll('.view').length, 2, 'todo count: 2');
  // apply empty string to the <input class="edit">:
  const editInput = document.querySelectorAll('.edit')[0] as HTMLInputElement;
  if (editInput) {
    editInput.value = '';
    // trigger the [Enter] keyboard key to ADD the new todo:
    document.dispatchEvent(new KeyboardEvent('keyup', {'key': 'Enter'}));
    // confirm that the todo item was removed!
    t.equal(document.querySelectorAll('.view').length, 1, 'todo count: 1');
  } else {
    t.fail('Edit input element not found');
  }
  t.end();
});

test('5.5 CANCEL should cancel edits on escape', function (t) {
  const element = document.getElementById(id);
  if (element) elmish.empty(element);
  localStorage.removeItem('todos-elmish_' + id);
  const model = {
    todos: [
      { id: 0, title: "Make something people want.", done: false },
      { id: 1, title: "Let's solve our own problem", done: false }
    ],
    hash: '#/', // the "route" to display
    editing: 1 // edit the 3rd todo list item (which has id == 2)
  };
  // render the view and append it to the DOM inside the `test-app` node:
  elmish.mount(model, app.update, app.view, id, app.subscriptions);
  const label = document.querySelectorAll('.view > label')[1] as HTMLLabelElement;
  t.equal(label.textContent,
    model.todos[1].title, 'todo id 1 has title: ' + model.todos[1].title);
  // apply empty string to the <input class="edit">:
  const editInput = document.querySelectorAll('.edit')[0] as HTMLInputElement;
  if (editInput) {
    editInput.value = 'Hello World';
    // trigger the [esc] keyboard key to CANCEL editing
    document.dispatchEvent(new KeyboardEvent('keyup', {'key': 'Escape'}));
    // confirm the item.title is still the original title:
    const updatedLabel = document.querySelectorAll('.view > label')[1] as HTMLLabelElement;
    t.equal(updatedLabel.textContent,
        model.todos[1].title, 'todo id 1 has title: ' + model.todos[1].title);
  } else {
    t.fail('Edit input not found');
  }
  localStorage.removeItem('todos-elmish_' + id);
  t.end();
});

test('6. Counter > should display the current number of todo items',
  function (t) {
  elmish.empty(document.getElementById(id) as HTMLElement);
  const model: TodoModel = {
    todos: [
      { id: 0, title: "Make something people want.", done: false },
      { id: 1, title: "Bootstrap for as long as you can", done: false },
      { id: 2, title: "Let's solve our own problem", done: false }
    ],
    hash: '#/'
  };
  // render the view and append it to the DOM inside the `test-app` node:
  elmish.mount(model, app.update, app.view, id, app.subscriptions);
  // count:
  const countElement = document.getElementById('count');
  if (countElement) {
    const count = parseInt(countElement.textContent || '0', 10);
    t.equal(count, model.todos.length, "displays todo item count: " + count);
  } else {
    t.fail('Count element not found');
  }

  elmish.empty(document.getElementById(id) as HTMLElement); // clear DOM ready for next test
  localStorage.removeItem('todos-elmish_' + id);
  t.end();
});

test('7. Clear Completed > should display the number of completed items',
  function (t) {
  elmish.empty(document.getElementById(id) as HTMLElement);
  const model: TodoModel = {
    todos: [
      { id: 0, title: "Make something people want.", done: false },
      { id: 1, title: "Bootstrap for as long as you can", done: true },
      { id: 2, title: "Let's solve our own problem", done: true }
    ],
    hash: '#/'
  };
  // render the view and append it to the DOM inside the `test-app` node:
  elmish.mount(model, app.update, app.view, id, app.subscriptions);
  // count todo items in DOM:
  t.equal(document.querySelectorAll('.view').length, 3,
    "at the start, there are 3 todo items in the DOM.");

  // count completed items
  const completedCountElement = document.getElementById('completed-count');
  const completed_count = completedCountElement && completedCountElement.textContent
    ? parseInt(completedCountElement.textContent, 10)
    : 0;
  const done_count = model.todos.filter(function(i) {return i.done }).length;
  t.equal(completed_count, done_count,
    "displays completed items count: " + completed_count);

  // clear completed items:
  const button = document.querySelectorAll('.clear-completed')[0] as HTMLButtonElement;
  button.click();

  // confirm that there is now only ONE todo list item in the DOM:
  t.equal(document.querySelectorAll('.view').length, 1,
    "after clearing completed items, there is only 1 todo item in the DOM.");

  // no clear completed button in the DOM when there are no "done" todo items:
  t.equal(document.querySelectorAll('.clear-completed').length, 0,
    'no clear-completed button when there are no done items.')

  const element = document.getElementById(id);
  if (element) elmish.empty(element); // clear DOM ready for next test
  localStorage.removeItem('todos-elmish_' + id);
  t.end();
});

test('8. Persistence > should persist its data', function (t) {
  const element = document.getElementById(id);
  if (element) elmish.empty(element);
  const model = {
    todos: [
      { id: 0, title: "Make something people want.", done: false }
    ],
    hash: '#/'
  };
  // render the view and append it to the DOM inside the `test-app` node:
  elmish.mount(model, app.update, app.view, id, app.subscriptions);
  // confirm that the model is saved to localStorage
  // console.log('localStorage', localStorage.getItem('todos-elmish_' + id));
  t.equal(localStorage.getItem('todos-elmish_' + id),
    JSON.stringify(model), "data is persisted to localStorage");

  if (element) elmish.empty(element); // clear DOM ready for next test
  localStorage.removeItem('todos-elmish_' + id);
  t.end();
});

test('9. Routing > should allow me to display active/completed/all items',
  function (t) {
  localStorage.removeItem('todos-elmish_' + id);
  elmish.empty(document.getElementById(id) as HTMLElement);
  const model: TodoModel = {
    todos: [
      { id: 0, title: "Make something people want.", done: false },
      { id: 1, title: "Bootstrap for as long as you can", done: true },
      { id: 2, title: "Let's solve our own problem", done: true }
    ],
    hash: '#/active' // ONLY ACTIVE items
  };
  // render the view and append it to the DOM inside the `test-app` node:
  elmish.mount(model, app.update, app.view, id, app.subscriptions);
  const mod = app.update('ROUTE', model, '');
  // t.equal(mod.hash, '#/', 'default route is #/');

  t.equal(document.querySelectorAll('.view').length, 1, "one active item");
  const selected = document.querySelectorAll('.selected')[0] as HTMLElement;
  t.equal(selected.id, 'active', "active footer filter is selected");

  // empty:
  const elementToEmptyActive = document.getElementById(id);
  if (elementToEmptyActive) {
    elmish.empty(elementToEmptyActive);
  }
  localStorage.removeItem('todos-elmish_' + id);
  // show COMPLETED items:
  model.hash = '#/completed';
  elmish.mount(model, app.update, app.view, id, app.subscriptions);
  t.equal(document.querySelectorAll('.view').length, 2,
    "two completed items");
  const selectedCompleted = document.querySelectorAll('.selected')[0] as HTMLElement;
  t.equal(selectedCompleted.id, 'completed', "completed footer filter is selected");

  // empty:
  const elementToEmptyCompleted = document.getElementById(id);
  if (elementToEmptyCompleted) {
    elmish.empty(elementToEmptyCompleted);
  }
  localStorage.removeItem('todos-elmish_' + id);
  // show ALL items:
  model.hash = '#/';
  elmish.mount(model, app.update, app.view, id, app.subscriptions);
  t.equal(document.querySelectorAll('.view').length, 3,
    "three items total");
  const selectedAll = document.querySelectorAll('.selected')[0] as HTMLElement;
  t.equal(selectedAll.id, 'all', "all footer filter is selected");

  const element = document.getElementById(id);
  if (element) elmish.empty(element); // clear DOM ready for next test
  localStorage.removeItem('todos-elmish_' + id);
  t.end();
});

