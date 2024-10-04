import test from 'tape'; // https://github.com/dwyl/learn-tape
import fs from 'fs'; // to read html files (see below)
import path from 'path'; // so we can open files cross-platform
import jsdomGlobal from 'jsdom-global';
import * as app from '../lib/todo-app'; // functions to test
import * as elmish from '../lib/elmish'; // import "elmish" core functions
import { Todo, Model, Action } from '../lib/todo-app';

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'));
jsdomGlobal(html); // https://github.com/rstacruz/jsdom-global
const id = 'test-app'; // all tests use 'test-app' as root element

// Remove duplicate interface definitions and use the ones from todo-app

type SignalFunction = app.SignalFunction<Action>;

test('`model` (Object) has desired keys', function (t: test.Test) {
  const keys = Object.keys(app.init());
  t.deepEqual(keys, ['todos', 'hash', 'input'], "`todos`, `hash`, and `input` keys are present.");
  t.true(Array.isArray(app.init().todos), "model.todos is an Array");
  t.end();
});

test('`update` default case should return model unmodified', function (t: test.Test) {
  const model: Model = { todos: [], hash: '', input: '' };
  const unmodified_model = app.update({ type: 'SET_HASH', hash: '' }, model);
  t.deepEqual(model, unmodified_model, "model returned unmodified");
  t.end();
});

test('update `ADD` a new todo item to model.todos Array', function (t: test.Test) {
  const model: Model = { todos: [], hash: '', input: '' }; // initial state
  t.equal(model.todos.length, 0, "initial model.todos.length is 0");
  const updated_model = app.update({ type: 'ADD', text: 'Add Todo List Item' }, model);
  const expected: Todo = { id: 1, title: "Add Todo List Item", done: false };
  t.equal(updated_model.todos.length, 1, "updated_model.todos.length is 1");
  t.deepEqual(updated_model.todos[0], expected, "Todo list item added.");
  t.end();
});

test('update `TOGGLE` a todo item from done=false to done=true', function (t: test.Test) {
  const model: Model = { todos: [], hash: '', input: '' }; // initial state
  const model_with_todo = app.update({ type: 'ADD', text: 'Toggle a todo list item' }, model);
  const item = model_with_todo.todos[0];
  const model_todo_done = app.update({ type: 'TOGGLE', id: item.id }, model_with_todo);
  const expected: Todo = { id: 1, title: "Toggle a todo list item", done: true };
  t.deepEqual(model_todo_done.todos[0], expected, "Todo list item Toggled.");
  t.end();
});

test('`TOGGLE` (undo) a todo item from done=true to done=false', function (t: test.Test) {
  const model: Model = { todos: [], hash: '', input: '' }; // initial state
  const model_with_todo = app.update({ type: 'ADD', text: 'Toggle a todo list item' }, model);
  const item = model_with_todo.todos[0];
  const model_todo_done = app.update({ type: 'TOGGLE', id: item.id }, model_with_todo);
  const expected: Todo = { id: 1, title: "Toggle a todo list item", done: true };
  t.deepEqual(model_todo_done.todos[0], expected, "Toggled done=false >> true");
  // add another item before "undoing" the original one:
  const model_second_item = app.update({ type: 'ADD', text: 'Second item' }, model_todo_done);
  t.equal(model_second_item.todos.length, 2, "there are TWO todo items");
  // Toggle the original item such that: done=true >> done=false
  const model_todo_undone = app.update({ type: 'TOGGLE', id: item.id }, model_second_item);
  const undone: Todo = { id: 1, title: "Toggle a todo list item", done: false };
  t.deepEqual(model_todo_undone.todos[0], undone, "Todo item Toggled > undone!");
  t.end();
});

// this is used for testing view functions which require a signal function
function mock_signal(): SignalFunction {
  return function inner_function(action: Action): void {
    console.log('done');
  };
}

test('render_item HTML for a single Todo Item', function (t: test.Test) {
  const model: Model = {
    todos: [
      { id: 1, title: "Learn Elm Architecture", done: true },
    ],
    hash: '#/', // the "route" to display
    input: ''
  };
  // render the ONE todo list item:
  const element = document.getElementById(id);
  if (element) {
    const renderedItem = app.render_item(model.todos[0], model, mock_signal());
    if (renderedItem instanceof HTMLElement) {
      element.appendChild(renderedItem);
    }
  }

  const completedElement = document.querySelectorAll('.completed')[0];
  const done = completedElement ? completedElement.textContent : null;
  t.equal(done, 'Learn Elm Architecture', 'Done: Learn "TEA"');

  const inputElement = document.querySelectorAll('input')[0] as HTMLInputElement;
  const checked = inputElement ? inputElement.checked : false;
  t.equal(checked, true, 'Done: ' + model.todos[0].title + " is done=true");

  const clearElement = document.getElementById(id);
  if (clearElement) {
    elmish.empty(clearElement); // clear DOM ready for next test
  }
  t.end();
});

test('render_item HTML without a valid signal function', function (t: test.Test) {
  const model: Model = {
    todos: [
      { id: 1, title: "Learn Elm Architecture", done: true },
    ],
    hash: '#/', // the "route" to display
    input: ''
  };
  // render the ONE todo list item:
  const element = document.getElementById(id);
  if (element) {
    const renderedItem = app.render_item(model.todos[0], model, mock_signal);
    if (renderedItem instanceof HTMLElement) {
      element.appendChild(renderedItem);
    }
  }

  const completedElement = document.querySelectorAll('.completed')[0];
  const done = completedElement ? completedElement.textContent : null;
  t.equal(done, 'Learn Elm Architecture', 'Done: Learn "TEA"');

  const inputElement = document.querySelectorAll('input')[0] as HTMLInputElement;
  const checked = inputElement ? inputElement.checked : false;
  t.equal(checked, true, 'Done: ' + model.todos[0].title + " is done=true");

  const clearElement = document.getElementById(id);
  if (clearElement) {
    elmish.empty(clearElement); // clear DOM ready for next test
  }
  t.end();
});

test('render_main "main" view using (elmish) HTML DOM functions', function (t: test.Test) {
  const model: Model = {
    todos: [
      { id: 1, title: "Learn Elm Architecture", done: true },
      { id: 2, title: "Build Todo List App",    done: false },
      { id: 3, title: "Win the Internet!",      done: false }
    ],
    hash: '#/', // the "route" to display
    input: ''
  };
  // render the "main" view and append it to the DOM inside the `test-app` node:
  const element = document.getElementById(id);
  if (element) {
    const renderedMain = app.render_main(model, mock_signal());
    if (renderedMain instanceof HTMLElement) {
      element.appendChild(renderedMain);
    }
  }
  // test that the title text in the model.todos was rendered to <label> nodes:
  document.querySelectorAll('.view').forEach(function (item, index) {
    if (item instanceof HTMLElement) {
      t.equal(item.textContent, model.todos[index].title,
      "index #" + index + " <label> text: " + item.textContent)
    }
  })

  const inputs = document.querySelectorAll('input'); // todo items are 1,2,3
  [true, false, false].forEach(function(state, index){
    const input = inputs[index + 1] as HTMLInputElement;
    if (input) {
      t.equal(input.checked, state,
        "Todo #" + index + " is done=" + state)
    }
  })
  const clearElement = document.getElementById(id);
  if (clearElement) {
    elmish.empty(clearElement); // clear DOM ready for next test
  }
  t.end();
});

test('render_footer view using (elmish) HTML DOM functions', function (t: test.Test) {
  const model: Model = {
    todos: [
      { id: 1, title: "Learn Elm Architecture", done: true },
      { id: 2, title: "Build Todo List App",    done: false },
      { id: 3, title: "Win the Internet!",      done: false }
    ],
    hash: '#/', // the "route" to display
    input: ''
  };
  // render_footer view and append it to the DOM inside the `test-app` node:
  const element = document.getElementById(id);
  if (element) {
    const renderedFooter = app.render_footer(model, mock_signal());
    if (renderedFooter instanceof HTMLElement) {
      element.appendChild(renderedFooter);
    }
  }

  // todo-count should display 2 items left (still to be done):
  const countElement = document.getElementById('count');
  const left = countElement ? countElement.innerHTML : '';
  t.equal(left, "<strong>2</strong> items left", "Todos remaining: " + left);

  // count number of footer <li> items:
  const liElements = document.querySelectorAll('li');
  t.equal(liElements.length, 3, "3 <li> in <footer>");

  // check footer link text and href:
  const link_text = ['All', 'Active', 'Completed'];
  const hrefs = ['#/', '#/active', '#/completed'];
  const anchorElements = document.querySelectorAll('a');
  anchorElements.forEach(function (a, index) {
    if (a instanceof HTMLAnchorElement) {
      // check link text:
      t.equal(a.textContent, link_text[index], "<footer> link #" + index
        + " is: " + a.textContent + " === " + link_text[index]);
      // check hrefs:
      t.equal(a.href.replace('about:blank', ''), hrefs[index],
      "<footer> link #" + index + " href is: " + hrefs[index]);
    }
  });

  // check for "Clear completed" button in footer:
  const clearCompletedElements = document.querySelectorAll('.clear-completed');
  const clearCompletedElement = clearCompletedElements[0];
  const clear = clearCompletedElement instanceof HTMLElement ? clearCompletedElement.textContent : '';
  t.equal(clear, 'Clear completed [1]',
    '<button> in <footer> "Clear completed [1]"');

  const clearElement = document.getElementById(id);
  if (clearElement) {
    elmish.empty(clearElement); // clear DOM ready for next test
  }
  t.end();
});

test('render_footer 1 item left (pluarisation test)', function (t: test.Test) {
  const model: Model = {
    todos: [
      { id: 1, title: "Be excellent to each other!", done: false }
    ],
    hash: '#/', // the "route" to display
    input: ''
  };
  // render_footer view and append it to the DOM inside the `test-app` node:
  const element = document.getElementById(id);
  if (element) {
    const renderedFooter = app.render_footer(model, mock_signal());
    if (renderedFooter instanceof HTMLElement) {
      element.appendChild(renderedFooter);
    }
  }

  // todo-count should display "1 item left" (still to be done):
  const countElement = document.getElementById('count');
  const left = countElement ? countElement.innerHTML : '';
  t.equal(left, "<strong>1</strong> item left", "Todos remaining: " + left);

  const clearElement = document.getElementById(id);
  if (clearElement) {
    elmish.empty(clearElement); // clear DOM ready for next test
  }
  t.end();
});

test('view renders the whole todo app using "partials"', function (t: test.Test) {
  // render the view and append it to the DOM inside the `test-app` node:
  const rootElement = document.getElementById(id);
  if (rootElement) {
    rootElement.appendChild(app.view({ todos: [], hash: '#/', input: '' }, mock_signal())); // initial_model
  }
  const h1Element = document.querySelectorAll('h1')[0];
  t.equal(h1Element ? h1Element.textContent : '', "todos", "<h1>todos");
  // placeholder:
  const placeholder = document.getElementById('new-todo') as HTMLInputElement;
  t.equal(placeholder?.getAttribute("placeholder"), "What needs to be done?", "placeholder set on <input>");
  // todo-count should display 0 items left (based on initial_model):
  const count = document.getElementById('count');
  const left = count ? count.innerHTML : '';
  t.equal(left, "<strong>0</strong> items left", "Todos remaining: " + left);
  const clearDomElement = document.getElementById(id);
  if (clearDomElement) {
    elmish.empty(clearDomElement); // clear DOM ready for next test
  }
  t.end();
});

test('1. No Todos, should hide #footer and #main', function (t: test.Test) {
  // render the view and append it to the DOM inside the `test-app` node:
  const appElement = document.getElementById(id);
  if (appElement) {
    appElement.appendChild(app.view({ todos: [], hash: '#/', input: '' }, mock_signal())); // No Todos
  }
  const main = document.getElementById('main');
  const main_display = main ? window.getComputedStyle(main).display : '';
  t.equal(main_display, 'none', "No Todos, hide #main");
  const footer = document.getElementById('footer');
  const main_footer = footer ? window.getComputedStyle(footer).display : '';
  t.equal(main_footer, 'none', "No Todos, hide #footer");
  const clearDomElement = document.getElementById(id);
  if (clearDomElement) {
    elmish.empty(clearDomElement); // clear DOM ready for next test
  }
  t.end();
});

// Testing localStorage requires "polyfil" because:a
// https://github.com/jsdom/jsdom/issues/1137 ¯\_(ツ)_/¯
// globals are usually bad! but a "necessary evil" here.
const mockLocalStorage = {
  _storage: {} as Record<string, string>,
  get length() {
    return Object.keys(this._storage).length;
  },
  clear: function() {
    this._storage = {};
  },
  key: function(n: number) {
    return Object.keys(this._storage)[n] || null;
  },
  getItem: function(key: string) {
   return key in this._storage ? this._storage[key] : null;
 },
 setItem: function (key: string, value: string) {
   this._storage[key] = value;
 },
 removeItem: function (key: string) {
   delete this._storage[key];
 }
};
global.localStorage = global.localStorage || mockLocalStorage;

localStorage.removeItem('todos-elmish_store');
test('2. New Todo, should allow me to add todo items', function (t: test.Test) {
    const rootElement = document.getElementById(id);
    if (rootElement) {
        elmish.empty(rootElement);
    }
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount({ todos: [], hash: '#/', input: '' }, app.update, app.view, id, app.subscriptions);
    const new_todo = document.getElementById('new-todo') as HTMLInputElement;
    // "type" content in the <input id="new-todo">:
    const todo_text = 'Make Everything Awesome!     '; // deliberate whitespace!
    if (new_todo) {
        new_todo.value = todo_text;
    }
    // trigger the [Enter] keyboard key to ADD the new todo:
    document.dispatchEvent(new KeyboardEvent('keyup', { 'keyCode': 13 }));
    const items = document.querySelectorAll('.view');
    t.equal(items.length, 1, "should allow me to add todo items");
    // check if the new todo was added to the DOM:
    const actual = document.getElementById('1')?.textContent;
    t.equal(todo_text.trim(), actual, "should trim text input");
    // subscription keyCode trigger "branch" test (should NOT fire the signal):
    const clone = document.getElementById(id)?.cloneNode(true);
    document.dispatchEvent(new KeyboardEvent('keyup', { 'keyCode': 42 }));
    t.deepEqual(document.getElementById(id), clone, "#" + id + " no change");
    // check that the <input id="new-todo"> was reset after the new item was added
    t.equal(new_todo ? new_todo.value : '', '', "should clear text input field when an item is added");
    const main = document.getElementById('main');
    const main_display = main ? window.getComputedStyle(main).display : '';
    t.equal('block', main_display, "should show #main and #footer when items added");
    const footer = document.getElementById('footer');
    const main_footer = footer ? window.getComputedStyle(footer).display : '';
    t.equal('block', main_footer, "item added, show #footer");
    const clearElement = document.getElementById(id);
    if (clearElement) {
        elmish.empty(clearElement); // clear DOM ready for next test
    }
    localStorage.removeItem('todos-elmish_' + id);
    t.end();
});

test('3. Mark all as completed ("TOGGLE_ALL")', function (t: test.Test) {
    elmish.empty(document.getElementById(id) as HTMLElement);
    localStorage.removeItem('todos-elmish_' + id);
    const model: Model = {
        todos: [
            { id: 0, title: "Learn Elm Architecture", done: true },
            { id: 1, title: "Build Todo List App",    done: false },
            { id: 2, title: "Win the Internet!",      done: false }
        ],
        hash: '#/', // the "route" to display
        input: ''
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, app.update, app.view, id, app.subscriptions);
    // confirm that the ONLY the first todo item is done=true:
    const items = document.querySelectorAll('.view');

    document.querySelectorAll('.toggle').forEach(function(item, index) {
        t.equal((item as HTMLInputElement).checked, model.todos[index].done,
            "Todo #" + index + " is done=" + (item as HTMLInputElement).checked
            + " text: " + items[index].textContent)
    })

    // click the toggle-all checkbox to trigger TOGGLE_ALL: >> true
    const toggleAll = document.getElementById('toggle-all') as HTMLInputElement;
    if (toggleAll) {
        toggleAll.click(); // click toggle-all checkbox
        document.querySelectorAll('.toggle').forEach(function(item, index) {
            t.equal((item as HTMLInputElement).checked, true,
                "TOGGLE each Todo #" + index + " is done=" + (item as HTMLInputElement).checked
                + " text: " + items[index].textContent)
        });
        t.equal(toggleAll.checked, true,
            "should allow me to mark all items as completed")

        // click the toggle-all checkbox to TOGGLE_ALL (again!) true >> false
        toggleAll.click(); // click toggle-all checkbox
        document.querySelectorAll('.toggle').forEach(function(item, index) {
            t.equal((item as HTMLInputElement).checked, false,
                "TOGGLE_ALL Todo #" + index + " is done=" + (item as HTMLInputElement).checked
                + " text: " + items[index].textContent)
        })
        t.equal(toggleAll.checked, false,
            "should allow me to clear the completion state of all items")

        // *manually* "click" each todo item:
        document.querySelectorAll('.toggle').forEach(function(item, index) {
            (item as HTMLInputElement).click(); // this should "toggle" the todo checkbox to done=true
            t.equal((item as HTMLInputElement).checked, true,
                ".toggle.click() (each) Todo #" + index + " which is done=" + (item as HTMLInputElement).checked
                + " text: " + items[index].textContent)
        });
        // the toggle-all checkbox should be "checked" as all todos are done=true!
        t.equal(toggleAll.checked, true,
            "complete all checkbox should update state when items are completed")
    }

    elmish.empty(document.getElementById(id) as HTMLElement); // clear DOM ready for next test
    localStorage.removeItem('todos-elmish_store');
    t.end();
});

test('4. Item: should allow me to mark items as complete', function (t: test.Test) {
    const rootElement = document.getElementById(id);
    if (rootElement) {
        elmish.empty(rootElement);
    }
    localStorage.removeItem('todos-elmish_' + id);
    const model: Model = {
        todos: [
            { id: 0, title: "Make something people want.", done: false }
        ],
        hash: '#/', // the "route" to display
        input: ''
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, app.update, app.view, id, app.subscriptions);
    const item = document.getElementById('0');
    t.equal(item?.textContent, model.todos[0].title, 'Item contained in model.');
    // confirm that the todo item is NOT done (done=false):
    const toggleItem = document.querySelectorAll('.toggle')[0] as HTMLInputElement;
    t.equal(toggleItem.checked, false, 'Item starts out "active" (done=false)');
    // click the checkbox to toggle it to done=true
    toggleItem.click();
    t.equal(toggleItem.checked, true, 'Item should allow me to mark items as complete');
    // click the checkbox to toggle it to done=false "undo"
    toggleItem.click();
    t.equal(toggleItem.checked, false, 'Item should allow me to un-mark items as complete');
    t.end();
});

test('4.1 DELETE item by clicking <button class="destroy">', function (t: test.Test) {
    const rootElement = document.getElementById(id);
    if (rootElement) {
        elmish.empty(rootElement);
    }
    localStorage.removeItem('todos-elmish_' + id);
    const model: Model = {
        todos: [
            { id: 0, title: "Make something people want.", done: false }
        ],
        hash: '#/', // the "route" to display
        input: ''
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, app.update, app.view, id, app.subscriptions);
    // const todo_count = ;
    t.equal(document.querySelectorAll('.destroy').length, 1, "one destroy button");
    const item = document.getElementById('0');
    if (item) {
        t.equal(item.textContent, model.todos[0].title, 'Item contained in DOM.');
        // DELETE the item by clicking on the <button class="destroy">:
        const button = item.querySelectorAll('button.destroy')[0] as HTMLButtonElement;
        button.click();
    }
    // confirm that there is no longer a <button class="destroy">
    t.equal(document.querySelectorAll('button.destroy').length, 0, 'there is no longer a <button class="destroy"> as the only item was DELETEd');
    t.equal(document.getElementById('0'), null, 'todo item successfully DELETEd');
    t.end();
});

test('5.1 Editing: > Render an item in "editing mode"', function (t: test.Test) {
    elmish.empty(document.getElementById(id) as HTMLElement);
    localStorage.removeItem('todos-elmish_' + id);
    const model: Model = {
        todos: [
            { id: 0, title: "Make something people want.", done: false },
            { id: 1, title: "Bootstrap for as long as you can", done: false },
            { id: 2, title: "Let's solve our own problem", done: false }
        ],
        hash: '#/', // the "route" to display
        input: '',
        editing: 2 // edit the 3rd todo list item (which has id == 2)
    };
    // render the ONE todo list item in "editing mode" based on model.editing:
    const container = document.getElementById(id);
    if (container) {
        const mockSignal: SignalFunction = () => {};
        container.appendChild(
            app.render_item(model.todos[2], model, mockSignal)
        );
        // test that signal (in case of the test mock_signal) is onclick attribute:
        const label = document.querySelectorAll('.view > label')[0] as HTMLLabelElement;
        if (label && label.onclick) {
            t.equal(typeof label.onclick, 'function',
                "mockSignal is onclick attribute of label");
        }
    }

    // test that the <li class="editing"> and <input class="edit"> was rendered:
    const editingElements = document.querySelectorAll('.editing');
    t.equal(editingElements.length, 1,
        "<li class='editing'> element is visible");
    const editInputs = document.querySelectorAll('.edit');
    t.equal(editInputs.length, 1,
        "<input class='edit'> element is visible");
    const editInput = editInputs[0] as HTMLInputElement;
    if (editInput) {
        t.equal(editInput.value, model.todos[2].title,
            "<input class='edit'> has value: " + model.todos[2].title);
    }
    t.end();
});

test('5.2 Double-click an item <label> to edit it', function (t: test.Test) {
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
        hash: '#/', // the "route" to display
        input: ''
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, app.update, app.view, id, app.subscriptions);
    const labels = document.querySelectorAll('.view > label');
    if (labels.length > 1) {
        const label = labels[1] as HTMLLabelElement;
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
            }
        }
    }
    t.end();
});

test('5.2.2 Slow clicks do not count as double-click > no edit!', function (t: test.Test) {
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
        hash: '#/', // the "route" to display
        input: ''
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, app.update, app.view, id, app.subscriptions);
    const label = document.querySelectorAll('.view > label')[1] as HTMLLabelElement;
    // "double-click" i.e. click the <label> twice in quick succession:
    label.click();
    setTimeout(function () {
        label.click();
        // confirm that we are now in editing mode:
        t.equal(document.querySelectorAll('.editing').length, 0, "<li class='editing'> element is NOT visible");
        t.end();
    }, 301);
});

test('5.3 [ENTER] Key in edit mode triggers SAVE action', function (t: test.Test) {
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
        hash: '#/', // the "route" to display
        input: ''
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, app.update, app.view, id, app.subscriptions);
    // change the
    const updated_title = "Do things that don\'t scale!  ";
    // apply the updated_title to the <input class="edit">:
    const editInput = document.querySelectorAll('.edit')[0] as HTMLInputElement;
    editInput.value = updated_title;
    // trigger the [Enter] keyboard key to ADD the new todo:
    document.dispatchEvent(new KeyboardEvent('keyup', { 'keyCode': 13 }));
    // confirm that the todo item title was updated to the updated_title:
    const label = document.querySelectorAll('.view > label')[1].textContent;
    t.equal(label, updated_title.trim(), "item title updated to:" + updated_title + ' (trimmed)');
    t.end();
});

test('5.4 SAVE should remove the item if an empty text string was entered', function (t: test.Test) {
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
        hash: '#/', // the "route" to display
        input: ''
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, app.update, app.view, id, app.subscriptions);
    t.equal(document.querySelectorAll('.view').length, 2, 'todo count: 2');
    // apply empty string to the <input class="edit">:
    const editInput = document.querySelectorAll('.edit')[0] as HTMLInputElement;
    editInput.value = '';
    // trigger the [Enter] keyboard key to ADD the new todo:
    document.dispatchEvent(new KeyboardEvent('keyup', { 'keyCode': 13 }));
    // confirm that the todo item was removed!
    t.equal(document.querySelectorAll('.view').length, 1, 'todo count: 1');
    t.end();
});

test('5.5 CANCEL should cancel edits on escape', function (t: test.Test) {
    const element = document.getElementById(id);
    if (element) {
        elmish.empty(element);
    }
    localStorage.removeItem('todos-elmish_' + id);
    const model: Model = {
        todos: [
            { id: 0, title: "Make something people want.", done: false },
            { id: 1, title: "Let's solve our own problem", done: false }
        ],
        hash: '#/', // the "route" to display
        input: ''
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, app.update, app.view, id, app.subscriptions);
    t.equal(document.querySelectorAll('.view > label')[1].textContent, model.todos[1].title, 'todo id 1 has title: ' + model.todos[1].title);
    // apply empty string to the <input class="edit">:
    (document.querySelectorAll('.edit')[0] as HTMLInputElement).value = 'Hello World';
    // trigger the [esc] keyboard key to CANCEL editing
    document.dispatchEvent(new KeyboardEvent('keyup', { 'keyCode': 27 }));
    // confirm the item.title is still the original title:
    t.equal(document.querySelectorAll('.view > label')[1].textContent, model.todos[1].title, 'todo id 1 has title: ' + model.todos[1].title);
    localStorage.removeItem('todos-elmish_' + id);
    t.end();
});

test('6. Counter > should display the current number of todo items', function (t: test.Test) {
    const element = document.getElementById(id);
    if (element) {
        elmish.empty(element);
    }
    const model: Model = {
        todos: [
            { id: 0, title: "Make something people want.", done: false },
            { id: 1, title: "Bootstrap for as long as you can", done: false },
            { id: 2, title: "Let's solve our own problem", done: false }
        ],
        hash: '#/',
        input: ''
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, app.update, app.view, id, app.subscriptions);
    // count:
    const countElement = document.getElementById('count');
    const count = countElement ? parseInt(countElement.textContent || '0', 10) : 0;
    t.equal(count, model.todos.length, "displays todo item count: " + count);

    const clearElement = document.getElementById(id);
    if (clearElement) {
        elmish.empty(clearElement); // clear DOM ready for next test
    }
    localStorage.removeItem('todos-elmish_' + id);
    t.end();
});

test('7. Clear Completed > should display the number of completed items', function (t: test.Test) {
    const element = document.getElementById(id);
    if (element) {
        elmish.empty(element);
    }
    const model: Model = {
        todos: [
            { id: 0, title: "Make something people want.", done: false },
            { id: 1, title: "Bootstrap for as long as you can", done: true },
            { id: 2, title: "Let's solve our own problem", done: true }
        ],
        hash: '#/',
        input: ''
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, app.update, app.view, id, app.subscriptions);
    // count todo items in DOM:
    t.equal(document.querySelectorAll('.view').length, 3, "at the start, there are 3 todo items in the DOM.");

    // count completed items
    const completedCountElement = document.getElementById('completed-count');
    const completed_count = completedCountElement
        ? parseInt(completedCountElement.textContent || '0', 10)
        : 0;
    const done_count = model.todos.filter(function(i) { return i.done; }).length;
    t.equal(completed_count, done_count, "displays completed items count: " + completed_count);

    // clear completed items:
    const button = document.querySelectorAll('.clear-completed')[0] as HTMLButtonElement;
    button.click();

    // confirm that there is now only ONE todo list item in the DOM:
    t.equal(document.querySelectorAll('.view').length, 1, "after clearing completed items, there is only 1 todo item in the DOM.");

    // no clear completed button in the DOM when there are no "done" todo items:
    t.equal(document.querySelectorAll('clear-completed').length, 0, 'no clear-completed button when there are no done items.');

    const clearElement = document.getElementById(id);
    if (clearElement) {
        elmish.empty(clearElement); // clear DOM ready for next test
    }
    localStorage.removeItem('todos-elmish_' + id);
    t.end();
});

test('8. Persistence > should persist its data', function (t: test.Test) {
    const element = document.getElementById(id);
    if (element) {
        elmish.empty(element);
    }
    localStorage.removeItem('todos-elmish_' + id);
    const model: Model = {
        todos: [
            { id: 0, title: "Make something people want.", done: false },
            { id: 1, title: "Bootstrap for as long as you can", done: false },
            { id: 2, title: "Let's solve our own problem", done: true }
        ],
        hash: '#/',
        input: ''
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, app.update, app.view, id, app.subscriptions);
    console.log('localStorage', localStorage.getItem('todos-elmish_' + id));
    t.equal(localStorage.getItem('todos-elmish_' + id), JSON.stringify(model), "data is persisted to localStorage");
    const clearElement = document.getElementById(id);
    if (clearElement) {
        elmish.empty(clearElement); // clear DOM ready for next test
    }
    localStorage.removeItem('todos-elmish_' + id);
    t.end();
});

test('9. Routing > should allow me to display active/completed/all items', function (t: test.Test) {
    localStorage.removeItem('todos-elmish_' + id);
    const element = document.getElementById(id);
    if (element) {
        elmish.empty(element);
    }
    const model: Model = {
        todos: [
            { id: 0, title: "Make something people want.", done: false },
            { id: 1, title: "Bootstrap for as long as you can", done: false },
            { id: 2, title: "Let's solve our own problem", done: true }
        ],
        hash: '#/',
        input: ''
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, app.update, app.view, id, app.subscriptions);
    t.equal(document.querySelectorAll('.view').length, 3, "3 items in DOM");
    // click the "Active" link in the footer:
    const active = document.querySelectorAll('a')[1];
    active.click();
    t.equal(document.querySelectorAll('.view').length, 2, "2 active items");
    let selected = document.querySelectorAll('.selected')[0];
    t.equal(selected.id, 'active', "active footer filter is selected");
    // click the "Completed" link in the footer:
    const completed = document.querySelectorAll('a')[2];
    completed.click();
    t.equal(document.querySelectorAll('.view').length, 1, "1 completed item");
    selected = document.querySelectorAll('.selected')[0];
    t.equal(selected.id, 'completed', "completed footer filter is selected");
    // click the "All" link in the footer:
    const all = document.querySelectorAll('a')[0];
    all.click();
    t.equal(document.querySelectorAll('.view').length, 3, "3 items (all) in DOM");
    selected = document.querySelectorAll('.selected')[0];
    t.equal(selected.id, 'all', "all footer filter is selected");
    // click the "Active" link in the footer:
    active.click();
    t.equal(document.querySelectorAll('.view').length, 2, "2 active items");
    selected = document.querySelectorAll('.selected')[0];
    t.equal(selected.id, 'active', "active footer filter is selected");
    // empty:
    const clearElement = document.getElementById(id);
    if (clearElement) {
        elmish.empty(clearElement);
    }
    localStorage.removeItem('todos-elmish_' + id);
    // show COMPLTED items:
    model.hash = '#/completed';
    elmish.mount(model, app.update, app.view, id, app.subscriptions);
    t.equal(document.querySelectorAll('.view').length, 1, "one completed item");
    selected = document.querySelectorAll('.selected')[0];
    t.equal(selected.id, 'completed', "completed footer filter is selected");
    // empty:
    const clearElement2 = document.getElementById(id);
    if (clearElement2) {
        elmish.empty(clearElement2);
    }
    localStorage.removeItem('todos-elmish_' + id);
    // show ALL items:
    model.hash = '#/';
    elmish.mount(model, app.update, app.view, id, app.subscriptions);
    t.equal(document.querySelectorAll('.view').length, 3, "three items total");
    selected = document.querySelectorAll('.selected')[0];
    t.equal(selected.id, 'all', "all footer filter is selected");
    const clearElement3 = document.getElementById(id);
    if (clearElement3) {
        elmish.empty(clearElement3); // clear DOM ready for next test
    }
    localStorage.removeItem('todos-elmish_' + id);
    t.end();
});
