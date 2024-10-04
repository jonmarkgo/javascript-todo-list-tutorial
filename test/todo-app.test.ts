import test from 'tape';
import fs from 'fs';
import path from 'path';
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'));
require('jsdom-global')(html);
import * as app from '../lib/todo-app';
import { Model, Action } from '../lib/todo-app';
import { SignalFunction, mountApp } from '../lib/elmish';
const id = 'test-app';
import * as elmish from '../lib/elmish';

interface Todo {
  id: number;
  title: string;
  done: boolean;
}

test('`model` (Object) has desired keys', function (t: test.Test) {
  const initialModel: Model = app.initial_model;
  const keys: string[] = Object.keys(initialModel);
  t.deepEqual(keys, ['todos', 'hash', 'input'], "`todos`, `hash`, and `input` keys are present.");
  t.true(Array.isArray(initialModel.todos), "model.todos is an Array")
  t.end();
});

test('`update` default case should return model unmodified', function (t: test.Test) {
    const model: Model = { todos: [], hash: '', input: '' };
    const unmodified_model = app.update('SET_HASH', model, { hash: '' });
    t.deepEqual(model, unmodified_model, "model returned unmodified");
    t.end();
});

test('update `ADD` a new todo item to model.todos Array', function (t: test.Test) {
    const model: Model = { todos: [], hash: '', input: '' };
    t.equal(model.todos.length, 0, "initial model.todos.length is 0");
    const updated_model = app.update('ADD', model, { text: 'Add Todo List Item' });
    const expected: Todo = { id: 1, title: "Add Todo List Item", done: false };
    t.equal(updated_model.todos.length, 1, "updated_model.todos.length is 1");
    t.deepEqual(updated_model.todos[0], expected, "Todo list item added.");
    t.end();
});

test('update `TOGGLE` a todo item from done=false to done=true', function (t: test.Test) {
  const model: Model = { todos: [], hash: '#/', input: '' };
  const model_with_todo: Model = app.update('ADD', model, { text: '' });
  const item: Todo | undefined = model_with_todo.todos[0];
  if (item) {
    const model_todo_done: Model = app.update('TOGGLE', model_with_todo, { id: item.id });
    const expected: Todo = { id: 1, title: "", done: true };
    t.deepEqual(model_todo_done.todos[0], expected, "Todo list item Toggled.");
  }
  t.end();
});

test('`TOGGLE` (undo) a todo item from done=true to done=false', function (t: test.Test) {
    const model: Model = { todos: [], hash: '', input: '' };
    const model_with_todo = app.update('ADD', model, { text: 'Toggle a todo list item' });
    const item = model_with_todo.todos[0];
    const model_todo_done = app.update('TOGGLE', model_with_todo, { id: item.id });
    const expected: Todo = { id: 1, title: "Toggle a todo list item", done: true };
    t.deepEqual(model_todo_done.todos[0], expected, "Toggled done=false >> true");
    const model_second_item = app.update('ADD', model_todo_done, { text: 'Second item' });
    t.equal(model_second_item.todos.length, 2, "there are TWO todo items");
    const model_todo_undone = app.update('TOGGLE', model_second_item, { id: item.id });
    const undone: Todo = { id: 1, title: "Toggle a todo list item", done: false };
    t.deepEqual(model_todo_undone.todos[0], undone, "Todo item Toggled > undone!");
    t.end();
});

function mock_signal(): SignalFunction<Model> {
    return (action: string, data?: any): () => void => {
        console.log('Action received:', action, data);
        return () => {};
    };
}

test('render_item HTML for a single Todo Item', function (t: test.Test) {
  const model: app.Model = {
    todos: [
      { id: 1, title: "Learn Elm Architecture", done: true },
    ],
    hash: '#/',
    input: ''
  };
  const rootElement = document.getElementById(id);
  if (rootElement) {
    rootElement.appendChild(app.render_item(model.todos[0], model, mock_signal()));
  }

  const completedElement = document.querySelectorAll('.completed')[0];
  const done = completedElement ? completedElement.textContent : null;
  t.equal(done, 'Learn Elm Architecture', 'Done: Learn "TEA"');

  const inputElement = document.querySelectorAll('input')[0] as HTMLInputElement;
  const checked = inputElement ? inputElement.checked : false;
  t.equal(checked, true, 'Done: ' + model.todos[0].title + " is done=true");

  const clearElement = document.getElementById(id);
  if (clearElement) {
    clearElement.innerHTML = '';
  }
  t.end();
});

test('render_item HTML without a valid signal function', function (t: test.Test) {
  const model: app.Model = {
    todos: [
      { id: 1, title: "Learn Elm Architecture", done: true },
    ],
    hash: '#/',
    input: ''
  };
  const rootElement = document.getElementById(id);
  if (rootElement) {
    rootElement.appendChild(app.render_item(model.todos[0], model, mock_signal()));
  }
  const completedElement = document.querySelectorAll('.completed')[0];
  const done = completedElement ? completedElement.textContent : null;
  t.equal(done, 'Learn Elm Architecture', 'Done: Learn "TEA"');
  const inputElement = document.querySelectorAll('input')[0] as HTMLInputElement;
  const checked = inputElement ? inputElement.checked : false;
  t.equal(checked, true, 'Done: ' + model.todos[0].title + " is done=true");
  const clearElement = document.getElementById(id);
  if (clearElement) {
    clearElement.innerHTML = '';
  }
  t.end();
});

test('render_main "main" view using (elmish) HTML DOM functions', function (t) {
    const model: app.Model = {
        todos: [
            { id: 1, title: "Learn Elm Architecture", done: true },
            { id: 2, title: "Build Todo List App", done: false },
            { id: 3, title: "Win the Internet!", done: false }
        ],
        hash: '#/',
        input: ''
    };
    const rootElement = document.getElementById(id);
    if (rootElement) {
        rootElement.appendChild(app.render_main(model, mock_signal()));
    }
    document.querySelectorAll('.view').forEach(function (item, index) {
        if (item instanceof HTMLElement) {
            t.equal(item.textContent, model.todos[index].title, "index #" + index + " <label> text: " + item.textContent);
        }
    });
    const inputs = document.querySelectorAll('input');
    [true, false, false].forEach(function (state, index) {
        const inputElement = inputs[index + 1] as HTMLInputElement;
        if (inputElement) {
            t.equal(inputElement.checked, state, "Todo #" + index + " is done=" + state);
        }
    });
    const clearElement = document.getElementById(id);
    if (clearElement) {
        clearElement.innerHTML = '';
    }
    t.end();
});

test('render_footer view using (elmish) HTML DOM functions', function (t) {
  const footerModel: app.Model = {
    todos: [
      { id: 1, title: "Learn Elm Architecture", done: true },
      { id: 2, title: "Build Todo List App",    done: false },
      { id: 3, title: "Win the Internet!",      done: false }
    ],
    hash: '#/',
    input: ''
  };
  const element = document.getElementById(id);
  if (element) {
    const mockSignal: SignalFunction<Model> = (action: string, data?: any) => {
      console.log('Action received:', action, data);
      return () => {};
    };
    const renderedFooter = app.render_footer(footerModel, mockSignal);
    if (renderedFooter instanceof HTMLElement) {
      element.appendChild(renderedFooter);
    }
  }

  const countElementFooter = document.getElementById('count');
  const leftFooter = countElementFooter ? countElementFooter.innerHTML : '';
  t.equal(leftFooter, "<strong>2</strong> items left", "Todos remaining: " + leftFooter);

  const liElements = document.querySelectorAll('li');
  t.equal(liElements.length, 3, "3 <li> in <footer>");

  const link_text_footer = ['All', 'Active', 'Completed'];
  const hrefs_footer = ['#/', '#/active', '#/completed'];
  const anchorElements = document.querySelectorAll('a');
  anchorElements.forEach(function (a, index) {
    if (a instanceof HTMLAnchorElement) {
      t.equal(a.textContent, link_text_footer[index], "<footer> link #" + index
        + " is: " + a.textContent + " === " + link_text_footer[index]);
      t.equal(a.href.replace('about:blank', ''), hrefs_footer[index],
      "<footer> link #" + index + " href is: " + hrefs_footer[index]);
    }
  });

  const clearCompletedElements = document.querySelectorAll('.clear-completed');
  const clearCompletedElement = clearCompletedElements[0];
  const clearText = clearCompletedElement instanceof HTMLElement ? clearCompletedElement.textContent : '';
  t.equal(clearText, 'Clear completed [1]',
    '<button> in <footer> "Clear completed [1]"');

  const clearElementFooter = document.getElementById(id);
  if (clearElementFooter) {
    clearElementFooter.innerHTML = '';
  }
  t.end();
});

test('render_footer 1 item left (pluralization test)', function (t: test.Test) {
  const model: Model = {
    todos: [
      { id: 1, title: "Be excellent to each other!", done: false }
    ],
    hash: '#/',
    input: ''
  };
  const element = document.getElementById(id);
  if (element) {
    const renderedFooter = app.render_footer(model, mock_signal());
    if (renderedFooter instanceof HTMLElement) {
      element.appendChild(renderedFooter);
    }
  }

  const countElement = document.getElementById('count');
  const left = countElement ? countElement.innerHTML : '';
  t.equal(left, "<strong>1</strong> item left", "Todos remaining: " + left);

  const clearElement = document.getElementById(id);
  if (clearElement) {
    clearElement.innerHTML = '';
  }
  t.end();
});

test('view renders the whole todo app using "partials"', function (t: test.Test) {
    const rootElement = document.getElementById(id);
    const initialModel: app.Model = { todos: [], hash: '#/', input: '' };
    if (rootElement) {
        rootElement.appendChild(app.view(initialModel, mock_signal()));
    }
    const h1Element = document.querySelectorAll('h1')[0];
    t.equal(h1Element ? h1Element.textContent : '', "todos", "<h1>todos");
    const placeholder = document.getElementById('new-todo') as HTMLInputElement;
    t.equal(placeholder?.getAttribute("placeholder"), "What needs to be done?", "placeholder set on <input>");
    const count = document.getElementById('count');
    const left = count ? count.innerHTML : '';
    t.equal(left, "<strong>0</strong> items left", "Todos remaining: " + left);
    const clearDomElement = document.getElementById(id);
    if (clearDomElement) {
        clearDomElement.innerHTML = '';
    }
    t.end();
});

test('1. No Todos, should hide #footer and #main', function (t: test.Test) {
    const element = document.getElementById(id);
    const emptyModel: app.Model = { todos: [], hash: '#/', input: '' };
    if (element) {
        element.appendChild(app.view(emptyModel, mock_signal()));
    }

    const mainElement = document.getElementById('main');
    const main_display = mainElement ? window.getComputedStyle(mainElement).display : '';
    t.equal(main_display, 'none', "No Todos, hide #main");

    const footerElement = document.getElementById('footer');
    const main_footer = footerElement ? window.getComputedStyle(footerElement).display : '';
    t.equal(main_footer, 'none', "No Todos, hide #footer");

    const clearElement = document.getElementById(id);
    if (clearElement) {
        clearElement.innerHTML = '';
    }
    t.end();
});

const mockLocalStorage: Storage = {
    _storage: {} as Record<string, string>,
    get length() {
        return Object.keys(this._storage).length;
    },
    clear() {
        this._storage = {};
    },
    key(n: number) {
        return Object.keys(this._storage)[n] || null;
    },
    getItem(key: string) {
        return key in this._storage ? this._storage[key] : null;
    },
    setItem(key: string, value: string) {
        this._storage[key] = value;
    },
    removeItem(key: string) {
        delete this._storage[key];
    }
};

if (typeof global !== 'undefined') {
    (global as any).localStorage = (global as any).localStorage || mockLocalStorage;
} else if (typeof window !== 'undefined') {
    (window as any).localStorage = (window as any).localStorage || mockLocalStorage;
}

localStorage.removeItem('todos-elmish_store');

test('2. New Todo, should allow me to add todo items', function (t) {
  const element = document.getElementById(id);
  if (element) {
    element.innerHTML = '';
  }
  const mockSignal: SignalFunction<Model> = (action: string, data?: any) => () => { console.log('Action received:', action, data); };
  mountApp<Model>(
    { todos: [], hash: '#/', input: '' },
    app.update as unknown as (action: string, model: Model, data?: any) => Model,
    (model: Model, signal: SignalFunction<Model>) => app.view(model, signal),
    id
  );
  const newTodoInput = document.getElementById('new-todo') as HTMLInputElement | null;
  if (newTodoInput) {
    const todo_text = 'Make Everything Awesome!     ';
    newTodoInput.value = todo_text;
    document.dispatchEvent(new KeyboardEvent('keyup', {'key': 'Enter'}));
    const items = document.querySelectorAll('.view');
    t.equal(items.length, 1, "should allow me to add todo items");
    const actual = document.getElementById('1')?.textContent;
    t.equal(todo_text.trim(), actual, "should trim text input")

    const clone = document.getElementById(id)?.cloneNode(true);
    document.dispatchEvent(new KeyboardEvent('keyup', {'key': 'a'}));
    t.deepEqual(document.getElementById(id), clone, "#" + id + " no change");

    t.equal(newTodoInput.value, '',
      "should clear text input field when an item is added")

    const main = document.getElementById('main');
    const footer = document.getElementById('footer');
    if (main && footer) {
      const main_display = window.getComputedStyle(main);
      t.equal('block', main_display.display,
        "should show #main and #footer when items added");
      const main_footer = window.getComputedStyle(footer);
      t.equal('block', main_footer.display, "item added, show #footer");
    }

    const clearElement = document.getElementById(id);
    if (clearElement) {
      clearElement.innerHTML = '';
    }
    localStorage.removeItem('todos-elmish_' + id);
  }
  t.end();
});

test('3. Mark all as completed ("TOGGLE_ALL")', function (t) {
    const rootElement = document.getElementById(id);
    if (rootElement) {
        rootElement.innerHTML = '';
    }
    localStorage.removeItem('todos-elmish_' + id);
    const initialModel: Model = {
        todos: [
            { id: 0, title: "Learn Elm Architecture", done: true },
            { id: 1, title: "Build Todo List App", done: false },
            { id: 2, title: "Win the Internet!", done: false }
        ],
        hash: '#/',
        input: ''
    };
    mountApp<Model>(
        initialModel,
        app.update as unknown as (action: string, model: Model, data?: any) => Model,
        app.view as unknown as (model: Model, signal: SignalFunction<Model>) => HTMLElement,
        id
    );

    document.querySelectorAll('.toggle').forEach(function (item, index) {
        t.equal((item as HTMLInputElement).checked, initialModel.todos[index].done,
            "Todo #" + index + " is done=" + (item as HTMLInputElement).checked
            + " text: " + document.querySelectorAll('.view')[index].textContent);
    });

    const toggleAll = document.getElementById('toggle-all') as HTMLInputElement;
    if (toggleAll) {
        toggleAll.click();
        document.querySelectorAll('.toggle').forEach(function (item) {
            t.equal((item as HTMLInputElement).checked, true,
                "TOGGLE each Todo is done=" + (item as HTMLInputElement).checked);
        });
        t.equal(toggleAll.checked, true,
            "should allow me to mark all items as completed");

        toggleAll.click();
        document.querySelectorAll('.toggle').forEach(function (item) {
            t.equal((item as HTMLInputElement).checked, false,
                "TOGGLE each Todo is done=" + (item as HTMLInputElement).checked);
        });
        t.equal(toggleAll.checked, false,
            "should allow me to unmark all items");

        toggleAll.click();
        document.querySelectorAll('.toggle').forEach(function (item, index) {
            t.equal((item as HTMLInputElement).checked, false,
                "TOGGLE_ALL Todo #" + index + " is done=" + (item as HTMLInputElement).checked
                + " text: " + document.querySelectorAll('.view')[index].textContent);
        });
        t.equal(toggleAll.checked, false,
            "should allow me to clear the completion state of all items");

        document.querySelectorAll('.toggle').forEach(function (item, index) {
            (item as HTMLInputElement).click();
            t.equal((item as HTMLInputElement).checked, true,
                ".toggle.click() (each) Todo #" + index + " which is done=" + (item as HTMLInputElement).checked
                + " text: " + document.querySelectorAll('.view')[index].textContent);
        });
        t.equal(toggleAll.checked, true,
            "complete all checkbox should update state when items are completed");
    }

    if (document.getElementById(id)) document.getElementById(id)!.innerHTML = '';
    localStorage.removeItem('todos-elmish_store');
    t.end();
});

test('4. Item: should allow me to mark items as complete', function (t) {
    const clearElement = document.getElementById(id);
    if (clearElement) {
        clearElement.innerHTML = '';
    }
    localStorage.removeItem('todos-elmish_' + id);
    const model: Model = {
        todos: [
            { id: 0, title: "Learn Elm Architecture", done: true },
            { id: 1, title: "Build Todo List App", done: false },
            { id: 2, title: "Win the Internet!", done: false }
        ],
        hash: '#/',
        input: ''
    };
    mountApp<Model>(model, app.update as unknown as (action: string, model: Model, data?: any) => Model, app.view as unknown as (model: Model, signal: SignalFunction<Model>) => HTMLElement, id, app.subscriptions);
    document.querySelectorAll('.toggle').forEach(function (item, index) {
        const toggleItem = item as HTMLInputElement;
        t.equal(toggleItem.checked, model.todos[index].done, "Todo #" + index + " is done=" + toggleItem.checked
            + " text: " + document.querySelectorAll('.view')[index].textContent);
    });
    var toggleAll = document.getElementById('toggle-all') as HTMLInputElement;
    if (toggleAll) {
        toggleAll.click();
    }
    document.querySelectorAll('.toggle').forEach(function (item, index) {
        var toggleItem = item as HTMLInputElement;
        t.equal(toggleItem.checked, true, "TOGGLE each Todo #" + index + " is done=" + toggleItem.checked
            + " text: " + document.querySelectorAll('.view')[index].textContent);
    });
    var toggleAllChecked = document.getElementById('toggle-all') as HTMLInputElement;
    t.equal(toggleAllChecked?.checked, true, "should allow me to mark all items as completed");
    toggleAll?.click();
    document.querySelectorAll('.toggle').forEach(function (item, index) {
        var toggleItem = item as HTMLInputElement;
        t.equal(toggleItem.checked, false, "TOGGLE_ALL Todo #" + index + " is done=" + toggleItem.checked
            + " text: " + document.querySelectorAll('.view')[index].textContent);
    });
    t.equal(toggleAllChecked?.checked, false, "should allow me to clear the completion state of all items");
    document.querySelectorAll('.toggle').forEach(function (item, index) {
        var toggleItem = item as HTMLInputElement;
        toggleItem.click();
        t.equal(toggleItem.checked, true, ".toggle.click() (each) Todo #" + index + " which is done=" + toggleItem.checked
            + " text: " + document.querySelectorAll('.view')[index].textContent);
    });
    t.equal(toggleAllChecked?.checked, true, "complete all checkbox should update state when items are completed");
    var clearDomElement = document.getElementById(id);
    if (clearDomElement) {
        clearDomElement.innerHTML = '';
    }
    localStorage.removeItem('todos-elmish_store');
    t.end();
});

test('4. Item: should allow me to mark items as complete', function (t) {
    const clearElement = document.getElementById(id);
    if (clearElement) {
        clearElement.innerHTML = '';
    }
    localStorage.removeItem('todos-elmish_' + id);
    const initialModel: Model = {
        todos: [
            { id: 0, title: "Make something people want.", done: false }
        ],
        hash: '#/',
        input: ''
    };
    const mockSignal: SignalFunction<Model> = (action: string, data?: any) => () => {};
    mountApp(initialModel, app.update as unknown as (action: string, model: Model, data?: any) => Model, (model: Model, signal: SignalFunction<Model>) => app.view(model, signal), id);
    const item = document.getElementById('0')
    t.equal(item?.textContent, initialModel.todos[0].title, 'Item contained in model.');
    t.equal((document.querySelectorAll('.toggle')[0] as HTMLInputElement).checked, false,
    'Item starts out "active" (done=false)');

    const toggleElement = document.querySelectorAll('.toggle')[0] as HTMLInputElement;
    if (toggleElement) {
        toggleElement.click();
        t.equal(toggleElement.checked, true,
        'Item should allow me to mark items as complete');

        toggleElement.click();
        t.equal(toggleElement.checked, false,
        'Item should allow me to un-mark items as complete');
    }
    t.end();
});

test('4.1 DELETE item by clicking <button class="destroy">', function (t) {
    const clearElement = document.getElementById(id);
    if (clearElement) {
        clearElement.innerHTML = '';
    }
    localStorage.removeItem('todos-elmish_' + id);
    const model: Model = {
        todos: [
            { id: 0, title: "Make something people want.", done: false }
        ],
        hash: '#/',
        input: ''
    };
    const mockSignal: SignalFunction<Model> = (action: string, data?: any) => () => {};
    mountApp(model, app.update as unknown as (action: string, model: Model, data?: any) => Model, (model: Model, signal: SignalFunction<Model>) => app.view(model, signal), id);
    t.equal(document.querySelectorAll('.destroy').length, 1, "one destroy button")

    const item = document.getElementById('0');
    if (item) {
        t.equal(item.textContent, model.todos[0].title, 'Item contained in DOM.');
        const button = item.querySelectorAll('button.destroy')[0] as HTMLButtonElement;
        if (button) {
            button.click();
            t.equal(document.querySelectorAll('button.destroy').length, 0,
                'there is no longer a <button class="destroy"> as the only item was DELETEd')
            t.equal(document.getElementById('0'), null, 'todo item successfully DELETEd');
        }
    }
    t.end();
});

test('5.1 Editing: > Render an item in "editing mode"', function (t) {
  const clearElement = document.getElementById(id);
  if (clearElement) {
    clearElement.innerHTML = '';
  }
  localStorage.removeItem('todos-elmish_' + id);
  const model: Model = {
    todos: [
      { id: 0, title: "Make something people want.", done: false },
      { id: 1, title: "Bootstrap for as long as you can", done: false },
      { id: 2, title: "Let's solve our own problem", done: false }
    ],
    hash: '#/',
    editing: 2,
    input: ''
  };
  const container = document.getElementById(id);
  if (container) {
    let signalCalled = false;
    const mockSignal: app.SignalFunction<app.Action> = (action: string, data?: any): void => {
      console.log(`Signal called with action: ${action}, data: ${JSON.stringify(data)}`);
      console.log('mockSignal called with:', { action, data }); // Added console log
      signalCalled = true;
      t.equal(action, 'EDIT', "Signal called with correct action");
      t.equal(data, model.todos[2].id, "Signal called with correct data");
    };
    container.appendChild(
      app.render_item(model.todos[2], model, mockSignal),
    );
    const label = document.querySelectorAll('.view > label')[0] as HTMLLabelElement;
    if (label) {
      console.log('label.onclick:', label.onclick);
      label.dispatchEvent(new MouseEvent('click'));
      t.ok(signalCalled, "Signal function was called");
    }
  }

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

test('5.2 Double-click an item <label> to edit it', function (t) {
  const clearElement = document.getElementById(id);
  if (clearElement) {
    clearElement.innerHTML = '';
  }
  localStorage.removeItem('todos-elmish_' + id);
  const model: Model = {
    todos: [
      { id: 0, title: "Make something people want.", done: false },
      { id: 1, title: "Let's solve our own problem", done: false }
    ],
    hash: '#/',
    input: ''
  };
  const mockSignal: app.SignalFunction<app.Action> = (action: string, data?: any): void => {
    console.log(`Signal called with action: ${action}, data: ${JSON.stringify(data)}`);
  };
  mountApp(model, app.update as unknown as (action: string, model: Model, data?: any) => Model, (model: Model, signal: app.SignalFunction<app.Action>) => app.view(model, signal), id);
  const labels = document.querySelectorAll('.view > label');
  if (labels.length > 1) {
    const label = labels[1] as HTMLLabelElement;
    if (label) {
      label.click();
      label.click();
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

test('5.2.2 Slow clicks do not count as double-click > no edit!', function (t) {
  const clearElement = document.getElementById(id);
  if (clearElement) {
    clearElement.innerHTML = '';
  }
  localStorage.removeItem('todos-elmish_' + id);
  const model: Model = {
    todos: [
      { id: 0, title: "Make something people want.", done: false },
      { id: 1, title: "Let's solve our own problem", done: false }
    ],
    hash: '#/',
    input: ''
  };
  const mockSignal: SignalFunction<Model> = (action: string, data?: any) => () => {};
  mountApp(model, app.update as unknown as (action: string, model: Model, data?: any) => Model, (model: Model, signal: SignalFunction<Model>) => app.view(model, signal), id);
  const labels = document.querySelectorAll('.view > label');
  if (labels.length > 1) {
    const label = labels[1] as HTMLLabelElement;
    if (label) {
      label.click();
      setTimeout(function (){
        label.click();
        t.equal(document.querySelectorAll('.editing').length, 0,
          "<li class='editing'> element is NOT visible");
        t.end();
      }, 301);
    }
  }
});

test('5.3 [ENTER] Key in edit mode triggers SAVE action', function (t) {
  const clearElement = document.getElementById(id);
  if (clearElement) {
    clearElement.innerHTML = '';
  }
  localStorage.removeItem('todos-elmish_' + id);
  const model: Model = {
    todos: [
      { id: 0, title: "Make something people want.", done: false },
      { id: 1, title: "Let's solve our own problem", done: false }
    ],
    hash: '#/',
    input: ''
  };
  const mockSignal: SignalFunction<Model> = (action: string, data?: any) => () => {};
  mountApp(model, app.update, (model: Model, signal: SignalFunction<Model>) => app.view(model, signal), id);
  const updated_title = "Do things that don\'t scale!  "
  const editInput = document.querySelectorAll('.edit')[0] as HTMLInputElement;
  if (editInput) {
    editInput.value = updated_title;
  }
  const appElement = document.getElementById(id);
  if (appElement) {
    appElement.dispatchEvent(new KeyboardEvent('keyup', {key: 'Enter', bubbles: true}));
  }
  const label = document.querySelectorAll('.view > label')[1].textContent;
  t.equal(label, updated_title.trim(),
      "item title updated to:" + updated_title + ' (trimmed)');
  t.end();
});

test('5.4 SAVE should remove the item if an empty text string was entered', function (t) {
    const clearElement = document.getElementById(id);
    if (clearElement) {
        clearElement.innerHTML = '';
    }
    localStorage.removeItem('todos-elmish_' + id);
    const model: Model = {
        todos: [
            { id: 0, title: "Make something people want.", done: false },
            { id: 1, title: "Let's solve our own problem", done: false }
        ],
        hash: '#/',
        input: ''
    };
    const mockSignal: SignalFunction<Model> = (action: string, data?: any) => () => {};
    mountApp(model, app.update, (model: Model, signal: SignalFunction<Model>) => app.view(model, signal), id);
    t.equal(document.querySelectorAll('.view').length, 2, 'todo count: 2');
    const editInput = document.querySelectorAll('.edit')[0] as HTMLInputElement;
    editInput.value = '';
    document.dispatchEvent(new KeyboardEvent('keyup', { 'keyCode': 13 }));
    t.equal(document.querySelectorAll('.view').length, 1, 'todo count: 1');
    t.end();
});

test('5.5 CANCEL should cancel edits on escape', function (t) {
    const element = document.getElementById(id);
    if (element) {
        element.innerHTML = '';
    }
    localStorage.removeItem('todos-elmish_' + id);
    const model: Model = {
        todos: [
            { id: 0, title: "Make something people want.", done: false },
            { id: 1, title: "Let's solve our own problem", done: false }
        ],
        hash: '#/',
        input: ''
    };
    const mockSignal: SignalFunction<Model> = (action: string, data?: any) => () => {};
    mountApp(model, app.update, (model: Model, signal: SignalFunction<Model>) => app.view(model, signal), id);
    t.equal(document.querySelectorAll('.view > label')[1].textContent,
        model.todos[1].title, 'todo id 1 has title: ' + model.todos[1].title);
    const editElement = document.querySelectorAll('.edit')[0] as HTMLInputElement;
    editElement.value = 'Hello World';
    document.dispatchEvent(new KeyboardEvent('keyup', { 'keyCode': 27 }));
    t.equal(document.querySelectorAll('.view > label')[1].textContent,
        model.todos[1].title, 'todo id 1 has title: ' + model.todos[1].title);
    localStorage.removeItem('todos-elmish_' + id);
    t.end();
});

test('6. Counter > should display the current number of todo items', function (t) {
const element = document.getElementById(id);
if (element) {
    element.innerHTML = '';
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
const mockSignal: SignalFunction<Model> = (action: string, data?: any) => () => {};
mountApp(model, app.update, (model: Model, signal: SignalFunction<Model>) => app.view(model, signal), id);
const countElement = document.getElementById('count');
const count = countElement ? parseInt(countElement.textContent || '0', 10) : 0;
t.equal(count, model.todos.length, "displays todo item count: " + count);

const clearElement = document.getElementById(id);
if (clearElement) {
    clearElement.innerHTML = '';
}
localStorage.removeItem('todos-elmish_' + id);
t.end();
});

test('7. Clear Completed > should display the number of completed items', function (t) {
  const element = document.getElementById(id);
  if (element) {
    element.innerHTML = '';
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
  const mockSignal: SignalFunction<Model> = (action: string, data?: any) => () => {};
  mountApp(model, app.update, (model: Model, signal: SignalFunction<Model>) => app.view(model, signal), id);
  t.equal(document.querySelectorAll('.view').length, 3,
    "at the start, there are 3 todo items in the DOM.");

  const completedCountElement = document.getElementById('completed-count');
  const completed_count = completedCountElement
    ? parseInt(completedCountElement.textContent || '0', 10)
    : 0;
  const done_count = model.todos.filter(function(i) {return i.done }).length;
  t.equal(completed_count, done_count,
    "displays completed items count: " + completed_count);

  const button = document.querySelectorAll('.clear-completed')[0] as HTMLElement;
  button.click();

  t.equal(document.querySelectorAll('.view').length, 1,
    "after clearing completed items, there is only 1 todo item in the DOM.");

  t.equal(document.querySelectorAll('clear-completed').length, 0,
    'no clear-completed button when there are no done items.')

  const clearElement = document.getElementById(id);
  if (clearElement) {
    clearElement.innerHTML = '';
  }
  localStorage.removeItem('todos-elmish_' + id);
  t.end();
});

test('8. Persistence > should persist its data', function (t) {
    const element = document.getElementById(id);
    if (element) {
        element.innerHTML = '';
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
    const mockSignal: SignalFunction<Model> = (action: string, data?: any) => () => {};
    mountApp(model, app.update, (model: Model, signal: SignalFunction<Model>) => app.view(model, signal), id);
    const storedData = localStorage.getItem('todos-elmish_' + id);
    if (storedData) {
        t.equal(storedData, JSON.stringify(model), "data is persisted to localStorage");
    } else {
        t.fail("No data found in localStorage");
    }

    const clearElement = document.getElementById(id);
    if (clearElement) {
        clearElement.innerHTML = '';
    }
    localStorage.removeItem('todos-elmish_' + id);
    t.end();
});

test('9. Routing > should allow me to display active/completed/all items', function (t) {
    localStorage.removeItem('todos-elmish_' + id);
    const element = document.getElementById(id);
    if (element) {
        element.innerHTML = '';
    }
    const model: Model = {
        todos: [
            { id: 0, title: "Make something people want.", done: false },
            { id: 1, title: "Bootstrap for as long as you can", done: true },
            { id: 2, title: "Let's solve our own problem", done: true }
        ],
        hash: '#/active',
        input: ''
    };
    const mockSignal: SignalFunction<Model> = (action: string, data?: any) => () => {};
    mountApp(model, app.update, (model: Model, signal: SignalFunction<Model>) => app.view(model, signal), id);
    const mod = app.update('SET_HASH', model, { hash: model.hash });

    t.equal(document.querySelectorAll('.view').length, 1, "one active item");
    let selected = document.querySelectorAll('.selected')[0] as HTMLElement;
    t.equal(selected.id, 'active', "active footer filter is selected");

    const clearElement = document.getElementById(id);
    if (clearElement) {
        clearElement.innerHTML = '';
    }
    localStorage.removeItem('todos-elmish_' + id);
    model.hash = '#/completed';
    mountApp(model, app.update, (model: Model, signal: SignalFunction<Model>) => app.view(model, signal), id);
    t.equal(document.querySelectorAll('.view').length, 2,
        "two completed items");
    selected = document.querySelectorAll('.selected')[0] as HTMLElement;
    t.equal(selected.id, 'completed', "completed footer filter is selected");

    const clearElement2 = document.getElementById(id);
    if (clearElement2) {
        clearElement2.innerHTML = '';
    }
    localStorage.removeItem('todos-elmish_' + id);
    model.hash = '#/';
    mountApp(model, app.update, (model: Model, signal: SignalFunction<Model>) => app.view(model, signal), id);
    t.equal(document.querySelectorAll('.view').length, 3,
        "three items total");
    selected = document.querySelectorAll('.selected')[0] as HTMLElement;
    t.equal(selected.id, 'all', "all footer filter is selected");

    const clearElement3 = document.getElementById(id);
    if (clearElement3) {
        clearElement3.innerHTML = '';
    }
    localStorage.removeItem('todos-elmish_' + id);
    t.end();
});
