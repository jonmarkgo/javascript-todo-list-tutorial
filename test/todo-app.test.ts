import test from 'tape';
import * as fs from 'fs';
import * as path from 'path';
import jsdomGlobal from 'jsdom-global';
import { TodoApp } from '../lib/todo-app';
import { Model } from '../lib/todo-app';
import * as elmish from '../lib/elmish';

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8');
jsdomGlobal(html);

const id = 'test-app';

function mock_signal(action: string, data?: any): void {
  // Mock implementation of signal function
}

// ... (existing test cases remain unchanged)

test('view renders the whole todo app using "partials"', (t: test.Test) => {
  const testApp = document.getElementById(id);
  if (testApp) {
    const model: Model = {
      todos: [],
      hash: '#/',
      all_done: false,
      clicked: undefined,
      click_time: undefined,
      editing: undefined
    };
    const viewElement = TodoApp.view(model, mock_signal);
    if (viewElement instanceof HTMLElement) {
      testApp.appendChild(viewElement);

      const h1Element = document.querySelector('h1');
      t.equal(h1Element?.textContent, "todos", "<h1>todos");

      const newTodoInput = document.getElementById('new-todo') as HTMLInputElement;
      const placeholder = newTodoInput?.getAttribute("placeholder");
      t.equal(placeholder, "What needs to be done?", "placeholder set on <input>");

      const countElement = document.getElementById('count');
      const left = countElement?.innerHTML;
      t.equal(left, "<strong>0</strong> items left", "Todos remaining: " + left);

      elmish.empty(testApp);
    } else {
      t.fail('view did not return an HTMLElement');
    }
  } else {
    t.fail('Test app element not found');
  }
  t.end();
});

test('1. No Todos, should hide #footer and #main', (t: test.Test) => {
  const testApp = document.getElementById(id);
  if (testApp) {
    const model: Model = {
      todos: [],
      hash: '#/',
      all_done: false,
      clicked: undefined,
      click_time: undefined,
      editing: undefined
    };
    const viewElement = TodoApp.view(model, mock_signal);
    if (viewElement instanceof HTMLElement) {
      testApp.appendChild(viewElement);

      const mainElement = document.getElementById('main');
      const footerElement = document.getElementById('footer');

      if (mainElement && footerElement) {
        const mainDisplay = window.getComputedStyle(mainElement).display;
        const footerDisplay = window.getComputedStyle(footerElement).display;

        t.equal(mainDisplay, 'none', "No Todos, hide #main");
        t.equal(footerDisplay, 'none', "No Todos, hide #footer");
      } else {
        t.fail('Main or footer element not found');
      }

      elmish.empty(testApp);
    } else {
      t.fail('view did not return an HTMLElement');
    }
  } else {
    t.fail('Test app element not found');
  }
  t.end();
});

test('2. New Todo, should allow me to add todo items', (t: test.Test) => {
  const testApp = document.getElementById(id);
  if (testApp) {
    const model: Model = {
      todos: [],
      hash: '#/',
      all_done: false,
      clicked: undefined,
      click_time: undefined,
      editing: undefined
    };
    const viewElement = TodoApp.view(model, mock_signal);
    if (viewElement instanceof HTMLElement) {
      testApp.appendChild(viewElement);

      const newTodoInput = document.getElementById('new-todo') as HTMLInputElement;
      if (newTodoInput) {
        const todo_text = 'Make Everything Awesome!     '; // deliberate whitespace!
        newTodoInput.value = todo_text;

        // trigger the [Enter] keyboard key to ADD the new todo:
        document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));
        const items = document.querySelectorAll('.view');
        t.equal(items.length, 1, "should allow me to add todo items");

        // check if the new todo was added to the DOM:
        const todoElement = document.getElementById('1');
        const actual = todoElement ? todoElement.textContent : '';
        t.equal(todo_text.trim(), actual, "should trim text input");

        // subscription keyCode trigger "branch" test (should NOT fire the signal):
        const clone = testApp.cloneNode(true);
        document.dispatchEvent(new KeyboardEvent('keyup', { key: 'a' }));
        t.deepEqual(testApp, clone, "#" + id + " no change");

        // check that the <input id="new-todo"> was reset after the new item was added
        t.equal(newTodoInput.value, '', "should clear text input field when an item is added");

        const mainElement = document.getElementById('main');
        const footerElement = document.getElementById('footer');
        if (mainElement && footerElement) {
          const mainDisplay = window.getComputedStyle(mainElement).display;
          const footerDisplay = window.getComputedStyle(footerElement).display;
          t.equal(mainDisplay, 'block', "should show #main when items added");
          t.equal(footerDisplay, 'block', "should show #footer when items added");
        } else {
          t.fail('Main or footer element not found');
        }

        elmish.empty(testApp);
      } else {
        t.fail('New todo input not found');
      }
    } else {
      t.fail('view did not return an HTMLElement');
    }
  } else {
    t.fail('Test app element not found');
  }
  t.end();
});

test('3. Mark all as completed ("TOGGLE_ALL")', (t: test.Test) => {
  const testApp = document.getElementById(id);
  if (testApp) {
    const model: Model = {
      todos: [
        { id: 0, title: "Learn Elm Architecture", done: true },
        { id: 1, title: "Build Todo List App",    done: false },
        { id: 2, title: "Win the Internet!",      done: false }
      ],
      hash: '#/',
      all_done: false,
      clicked: undefined,
      click_time: undefined,
      editing: undefined
    };
    const viewElement = TodoApp.view(model, mock_signal);
    if (viewElement instanceof HTMLElement) {
      testApp.appendChild(viewElement);

      const toggleAllCheckbox = document.getElementById('toggle-all') as HTMLInputElement;
      const todoItems = document.querySelectorAll('.toggle') as NodeListOf<HTMLInputElement>;

      if (toggleAllCheckbox && todoItems.length === model.todos.length) {
        // Verify initial state
        todoItems.forEach((item, index) => {
          t.equal(item.checked, model.todos[index].done, `Todo #${index} initial state is correct`);
        });

        // Toggle all to completed
        toggleAllCheckbox.click();
        todoItems.forEach((item, index) => {
          t.equal(item.checked, true, `Todo #${index} is marked as completed`);
        });
        t.equal(toggleAllCheckbox.checked, true, "Toggle all checkbox is checked");

        // Toggle all to active
        toggleAllCheckbox.click();
        todoItems.forEach((item, index) => {
          t.equal(item.checked, false, `Todo #${index} is marked as active`);
        });
        t.equal(toggleAllCheckbox.checked, false, "Toggle all checkbox is unchecked");

        // Manually toggle each item
        todoItems.forEach((item, index) => {
          item.click();
          t.equal(item.checked, true, `Todo #${index} is manually toggled to completed`);
        });
        t.equal(toggleAllCheckbox.checked, true, "Toggle all checkbox is checked when all items are completed");

        elmish.empty(testApp);
      } else {
        t.fail('Toggle all checkbox or todo items not found');
      }
    } else {
      t.fail('view did not return an HTMLElement');
    }
  } else {
    t.fail('Test app element not found');
  }
  t.end();
});

test('4. Item: should allow me to mark items as complete', (t: test.Test) => {
  const testApp = document.getElementById(id);
  if (testApp) {
    const model: Model = {
      todos: [
        { id: 0, title: "Make something people want.", done: false }
      ],
      hash: '#/',
      all_done: false,
      clicked: undefined,
      click_time: undefined,
      editing: undefined
    };
    const viewElement = TodoApp.view(model, mock_signal);
    if (viewElement instanceof HTMLElement) {
      testApp.appendChild(viewElement);

      const todoItem = document.querySelector('.toggle') as HTMLInputElement;
      if (todoItem) {
        t.equal(todoItem.checked, false, "Item should be unchecked initially");
        todoItem.click();
        t.equal(todoItem.checked, true, "Item should be checked after clicking");
      } else {
        t.fail('Todo item checkbox not found');
      }

      elmish.empty(testApp);
    } else {
      t.fail('view did not return an HTMLElement');
    }
  } else {
    t.fail('Test app element not found');
  }
  t.end();
});

test('4.1 DELETE item by clicking <button class="destroy">', (t: test.Test) => {
  const testApp = document.getElementById(id);
  if (testApp) {
    const model: Model = {
      todos: [
        { id: 0, title: "Make something people want.", done: false }
      ],
      hash: '#/',
      all_done: false,
      clicked: undefined,
      click_time: undefined,
      editing: undefined
    };
    const viewElement = TodoApp.view(model, mock_signal);
    if (viewElement instanceof HTMLElement) {
      testApp.appendChild(viewElement);

      const destroyButton = document.querySelector('.destroy') as HTMLButtonElement;
      if (destroyButton) {
        const initialTodoCount = document.querySelectorAll('.view').length;
        t.equal(initialTodoCount, 1, "There should be one todo item initially");

        destroyButton.click();

        const finalTodoCount = document.querySelectorAll('.view').length;
        t.equal(finalTodoCount, 0, "The todo item should be deleted after clicking the destroy button");
      } else {
        t.fail('Destroy button not found');
      }

      elmish.empty(testApp);
    } else {
      t.fail('view did not return an HTMLElement');
    }
  } else {
    t.fail('Test app element not found');
  }
  t.end();
});

test('8. Persistence > should persist its data', (t: test.Test) => {
  const testApp = document.getElementById(id);
  if (testApp) {
    const model: Model = {
      todos: [
        { id: 0, title: "Make something people want.", done: false }
      ],
      hash: '#/',
      all_done: false,
      clicked: undefined,
      click_time: undefined,
      editing: undefined
    };
    const viewElement = TodoApp.view(model, mock_signal);
    if (viewElement instanceof HTMLElement) {
      testApp.appendChild(viewElement);

      // confirm that the model is saved to localStorage
      const storedData = localStorage.getItem('todos-elmish_' + id);
      t.equal(storedData, JSON.stringify(model), "data is persisted to localStorage");

      elmish.empty(testApp);
    } else {
      t.fail('view did not return an HTMLElement');
    }
  } else {
    t.fail('Test app element not found');
  }
  localStorage.removeItem('todos-elmish_' + id);
  t.end();
});

// End of tests
