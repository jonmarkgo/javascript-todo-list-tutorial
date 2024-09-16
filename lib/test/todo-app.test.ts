import { describe, it, beforeEach, afterEach, expect } from '@jest/globals';
import { Action, initial_model, update, view, subscriptions, model, render_item, render_main, render_footer } from '../../lib/todo-app.js';
import * as elmish from '../../lib/elmish.js';
import { TodoState, Todo } from '../../lib/types.js';
import { JSDOM } from 'jsdom';

// JSDOM setup
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window as unknown as Window & typeof globalThis;

// Setup and teardown for each test
beforeEach(() => {
  const testApp = document.createElement('div');
  testApp.id = 'test-app';
  document.body.appendChild(testApp);
  localStorage.clear();
});

afterEach(() => {
  const testApp = document.getElementById('test-app');
  if (testApp) {
    testApp.innerHTML = ''; // Clear the content instead of removing the element
  }
  document.body.innerHTML = '';
});

const id = 'test-app';              // all tests use 'test-app' as root element

// JSDOM provides a working localStorage implementation, so we don't need a custom mock

describe('Todo App', () => {
  describe('model', () => {
    it('has desired keys', () => {
      const keys = Object.keys(initial_model);
      expect(keys).toEqual(['todos', 'hash', 'all_done', 'editing', 'clicked', 'click_time']);
      expect(Array.isArray(initial_model.todos)).toBe(true);
    });
  });
});

describe('update function', () => {
  it('should return model unmodified for unknown action', () => {
    const model: TodoState = JSON.parse(JSON.stringify(initial_model));
    const unmodified_model = update('UNKNOWN_ACTION', model, '');
    expect(model).toEqual(unmodified_model);
  });

  it('should add a new todo item to model.todos Array', () => {
    const model: TodoState = JSON.parse(JSON.stringify(initial_model)); // initial state
    expect(model.todos.length).toBe(0);
    const updated_model = update('ADD', model, "Add Todo List Item");
    const expected: Todo = { id: 1, title: "Add Todo List Item", done: false };
    expect(updated_model.todos.length).toBe(1);
    expect(updated_model.todos[0]).toEqual(expected);
  });
});

describe('update TOGGLE', () => {
  it('should toggle a todo item from done=false to done=true', () => {
    const model: TodoState = JSON.parse(JSON.stringify(initial_model)); // initial state
    const model_with_todo = update('ADD', model, "Toggle a todo list item");
    const item = model_with_todo.todos[0];
    const model_todo_done = update('TOGGLE', model_with_todo, item.id);
    const expected: Todo = { id: 1, title: "Toggle a todo list item", done: true };
    expect(model_todo_done.todos[0]).toEqual(expected);
  });

  it('should toggle (undo) a todo item from done=true to done=false', () => {
    const model: TodoState = JSON.parse(JSON.stringify(initial_model)); // initial state
    const model_with_todo = update('ADD', model, "Toggle a todo list item");
    const item = model_with_todo.todos[0];
    const model_todo_done = update('TOGGLE', model_with_todo, item.id);
    const expected: Todo = { id: 1, title: "Toggle a todo list item", done: true };
    expect(model_todo_done.todos[0]).toEqual(expected);

    // add another item before "undoing" the original one:
    const model_second_item = update('ADD', model_todo_done, "Another todo");
    expect(model_second_item.todos).toHaveLength(2);

    // Toggle the original item such that: done=true >> done=false
    const model_todo_undone = update('TOGGLE', model_second_item, item.id);
    const undone: Todo = { id: 1, title: "Toggle a todo list item", done: false };
    expect(model_todo_undone.todos[0]).toEqual(undone);
  });
});

// this is used for testing view functions which require a signal function
function mock_signal(): (action: Action, data?: string | number) => () => void {
  return function(action: Action, data?: string | number) {
    return function inner_function() {
      console.log('Action:', action, 'Data:', data);
    }
  }
}

describe('render_item', () => {
  it('should render HTML for a single Todo Item', () => {
    const model: TodoState = {
      todos: [
        { id: 1, title: "Learn Elm Architecture", done: true },
      ],
      hash: '#/', // the "route" to display
      all_done: false,
      editing: undefined,
      clicked: undefined,
      click_time: undefined
    };

    const container = document.getElementById(id);
    expect(container).toBeTruthy();

    if (container) {
      container.appendChild(
        render_item(model.todos[0], model, mock_signal()),
      );

      const doneElement = document.querySelector('.completed');
      expect(doneElement).toBeTruthy();
      expect(doneElement?.textContent).toBe('Learn Elm Architecture');

      const checkedElement = document.querySelector('input') as HTMLInputElement | null;
      expect(checkedElement).toBeTruthy();
      if (checkedElement) {
        expect(checkedElement.checked).toBe(true);
      }

      elmish.empty(container);
    }
  });
});

describe('render_item', () => {
  it('should render HTML without a valid signal function', () => {
    const model: TodoState = {
      todos: [
        { id: 1, title: "Learn Elm Architecture", done: true },
      ],
      hash: '#/', // the "route" to display
      all_done: false,
      editing: undefined,
      clicked: undefined,
      click_time: undefined
    };

    const element = document.getElementById(id);
    expect(element).toBeTruthy();

    if (element) {
      element.appendChild(
        render_item(model.todos[0], model, () => () => {})
      );

      const doneElement = document.querySelector('.completed');
      expect(doneElement).toBeTruthy();
      expect(doneElement?.textContent).toBe('Learn Elm Architecture');

      const checkedElement = document.querySelector('input') as HTMLInputElement | null;
      expect(checkedElement).toBeTruthy();
      if (checkedElement) {
        expect(checkedElement.checked).toBe(true);
      }

      elmish.empty(element);
    }
  });
});

describe('render_main', () => {
  it('should render "main" view using (elmish) HTML DOM functions', () => {
    const model: TodoState = {
      todos: [
        { id: 1, title: "Learn Elm Architecture", done: true },
        { id: 2, title: "Build Todo List App",    done: false },
        { id: 3, title: "Win the Internet!",      done: false }
      ],
      hash: '#/', // the "route" to display
      all_done: false,
      editing: undefined,
      clicked: undefined,
      click_time: undefined
    };

    // render the "main" view and append it to the DOM inside the `test-app` node:
    const container = document.getElementById(id);
    expect(container).toBeTruthy();

    if (container) {
      container.appendChild(render_main(model, mock_signal()));

      // test that the title text in the model.todos was rendered to <label> nodes:
      const viewElements = document.querySelectorAll('.view');
      viewElements.forEach((item, index) => {
        expect(item.textContent).toBe(model.todos[index].title);
      });

      const inputs = document.querySelectorAll('input'); // todo items are 1,2,3
      [true, false, false].forEach((state, index) => {
        const input = inputs[index + 1] as HTMLInputElement;
        expect(input.checked).toBe(state);
      });

      elmish.empty(container);
    }
  });
});

describe('render_footer', () => {
  it('should render footer view using (elmish) HTML DOM functions', () => {
    const model: TodoState = {
      todos: [
        { id: 1, title: "Learn Elm Architecture", done: true },
        { id: 2, title: "Build Todo List App",    done: false },
        { id: 3, title: "Win the Internet!",      done: false }
      ],
      hash: '#/', // the "route" to display
      all_done: false,
      editing: undefined,
      clicked: undefined,
      click_time: undefined
    };

    const container = document.getElementById(id);
    expect(container).toBeTruthy();

    if (container) {
      container.appendChild(render_footer(model, mock_signal()));

      // todo-count should display 2 items left (still to be done):
      const countElement = document.getElementById('count');
      expect(countElement).toBeTruthy();
      if (countElement) {
        expect(countElement.innerHTML).toBe("<strong>2</strong> items left");
      }

      // count number of footer <li> items:
      expect(document.querySelectorAll('li').length).toBe(3);

      // check footer link text and href:
      const link_text = ['All', 'Active', 'Completed'];
      const hrefs = ['#/', '#/active', '#/completed'];
      const anchorElements = document.querySelectorAll('a');
      anchorElements.forEach((a, index) => {
        expect(a.textContent).toBe(link_text[index]);
        expect(a.getAttribute('href')).toBe(hrefs[index]);
      });

      // check for "Clear completed" button in footer:
      const clearElement = document.querySelector('.clear-completed');
      expect(clearElement).toBeTruthy();
      if (clearElement) {
        expect(clearElement.textContent).toBe('Clear completed [1]');
      }

      elmish.empty(container);
    }
  });
});

describe('render_footer', () => {
  it('should display "1 item left" for pluralization', () => {
    const model: TodoState = {
      todos: [
        { id: 1, title: "Be excellent to each other!", done: false }
      ],
      hash: '#/', // the "route" to display
      all_done: false,
      editing: undefined,
      clicked: undefined,
      click_time: undefined
    };
    // render_footer view and append it to the DOM inside the `test-app` node:
    const container = document.getElementById(id);
    expect(container).toBeTruthy();

    if (container) {
      container.appendChild(render_footer(model, mock_signal()));

      // todo-count should display "1 item left" (still to be done):
      const countElement = document.getElementById('count');
      expect(countElement).toBeTruthy();
      if (countElement) {
        expect(countElement.innerHTML).toBe("<strong>1</strong> item left");
      }
    }

    elmish.empty(container as HTMLElement);
  });
});

describe('view', () => {
  it('renders the whole todo app using "partials"', () => {
    // render the view and append it to the DOM inside the `test-app` node:
    const container = document.getElementById(id);
    expect(container).toBeTruthy();

    if (container) {
      container.appendChild(view(model, mock_signal())); // initial_model

      const h1Element = document.querySelector('h1');
      expect(h1Element).toBeTruthy();
      expect(h1Element?.textContent).toBe("todos");

      // placeholder:
      const newTodoElement = document.getElementById('new-todo') as HTMLInputElement;
      expect(newTodoElement).toBeTruthy();
      expect(newTodoElement.getAttribute("placeholder")).toBe("What needs to be done?");

      // todo-count should display 0 items left (based on initial_model):
      const countElement = document.getElementById('count');
      expect(countElement).toBeTruthy();
      expect(countElement?.innerHTML).toBe("<strong>0</strong> items left");
    }

    elmish.empty(container as HTMLElement);
  });
});

describe('1. No Todos', () => {
  it('should hide #footer and #main', () => {
    // render the view and append it to the DOM inside the `test-app` node:
    const container = document.getElementById(id);
    expect(container).toBeTruthy();

    if (container) {
      container.appendChild(view({todos: [], hash: '#/'}, mock_signal())); // No Todos

      const mainElement = document.getElementById('main');
      expect(mainElement).toBeTruthy();
      if (mainElement) {
        const main_display = window.getComputedStyle(mainElement);
        expect(main_display.display).toBe('none');
      }

      const footerElement = document.getElementById('footer');
      expect(footerElement).toBeTruthy();
      if (footerElement) {
        const main_footer = window.getComputedStyle(footerElement);
        expect(main_footer.display).toBe('none');
      }
    }

    elmish.empty(container as HTMLElement);
  });
});

// JSDOM provides a working localStorage implementation, so we don't need a custom one.
// We'll just clear localStorage before each test to ensure a clean state.
beforeEach(() => {
  localStorage.clear();
});

// Remove any leftover data from previous tests
localStorage.removeItem('todos-elmish_store');

describe('2. New Todo', () => {
  it('should allow me to add todo items', () => {
    const container = document.getElementById(id);
    expect(container).toBeTruthy();

    if (container) {
      elmish.empty(container);
      // render the view and append it to the DOM inside the `test-app` node:
      elmish.mount({todos: [], hash: '#/'}, update, view, id, subscriptions);
      const new_todo = document.getElementById('new-todo') as HTMLInputElement;
      expect(new_todo).toBeTruthy();

      if (new_todo) {
        // "type" content in the <input id="new-todo">:
        const todo_text = 'Make Everything Awesome!     '; // deliberate whitespace!
        new_todo.value = todo_text;
        // trigger the [Enter] key
        document.dispatchEvent(new KeyboardEvent('keyup', {'key': 'Enter'}));

        // Check if the todo was added
        const items = document.querySelectorAll('.view');
        expect(items.length).toBe(1);

        // check if the new todo was added to the DOM:
        const actual = document.getElementById('1')?.textContent;
        expect(actual).toBe(todo_text.trim());

        // check that the <input id="new-todo"> was reset after the new item was added
        expect(new_todo.value).toBe('');

        const mainElement = document.getElementById('main');
        const footerElement = document.getElementById('footer');
        expect(mainElement).toBeTruthy();
        expect(footerElement).toBeTruthy();

        if (mainElement && footerElement) {
          const main_display = window.getComputedStyle(mainElement);
          const footer_display = window.getComputedStyle(footerElement);
          expect(main_display.display).toBe('block');
          expect(footer_display.display).toBe('block');
        }
      }
    }

    elmish.empty(container as HTMLElement);
    localStorage.removeItem('todos-elmish_store');
  });
});

describe('4. Item', () => {
  it('should allow me to mark items as complete', () => {
    const container = document.getElementById(id);
    expect(container).toBeTruthy();

    if (container) {
      elmish.empty(container);
      localStorage.removeItem('todos-elmish_' + id);
      const model: TodoState = {
        todos: [
          { id: 0, title: "Make something people want.", done: false }
        ],
        hash: '#/', // the "route" to display
        all_done: false,
        editing: undefined,
        clicked: undefined,
        click_time: undefined
      };
      // render the view and append it to the DOM inside the `test-app` node:
      elmish.mount(model, update, view, id, subscriptions);
      const item = document.getElementById('0');
      expect(item).toBeTruthy();
      expect(item?.textContent).toBe(model.todos[0].title);

      // confirm that the todo item is NOT done (done=false):
      const toggle = document.querySelector('.toggle') as HTMLInputElement;
      expect(toggle).toBeTruthy();
      expect(toggle.checked).toBe(false);

      // click the checkbox to toggle it to done=true
      toggle.click();
      expect(toggle.checked).toBe(true);

      // click the checkbox to toggle it to done=false "undo"
      toggle.click();
      expect(toggle.checked).toBe(false);
    }
  });
});

describe('4.1 DELETE item', () => {
  it('should delete an item by clicking <button class="destroy">', () => {
    const container = document.getElementById(id);
    expect(container).toBeTruthy();

    if (container) {
      elmish.empty(container);
      localStorage.removeItem('todos-elmish_' + id);
      const model: TodoState = {
        todos: [
          { id: 0, title: "Make something people want.", done: false }
        ],
        hash: '#/', // the "route" to display
        all_done: false,
        editing: undefined,
        clicked: undefined,
        click_time: undefined
      };
      // render the view and append it to the DOM inside the `test-app` node:
      elmish.mount(model, update, view, id, subscriptions);

      expect(document.querySelectorAll('.destroy').length).toBe(1);

      const item = document.getElementById('0');
      expect(item).toBeTruthy();
      expect(item?.textContent).toBe(model.todos[0].title);

      // DELETE the item by clicking on the <button class="destroy">:
      const button = item?.querySelector('button.destroy') as HTMLButtonElement;
      expect(button).toBeTruthy();
      button?.click();

      // confirm that there is no longer a <button class="destroy">
      expect(document.querySelectorAll('button.destroy').length).toBe(0);
      expect(document.getElementById('0')).toBeNull();
    }
  });
});

describe('5.1 Editing', () => {
  it('should render an item in "editing mode"', () => {
    const container = document.getElementById(id);
    expect(container).toBeTruthy();

    if (container) {
      elmish.empty(container);
      localStorage.removeItem('todos-elmish_' + id);
      const model: TodoState = {
        todos: [
          { id: 0, title: "Make something people want.", done: false },
          { id: 1, title: "Bootstrap for as long as you can", done: false },
          { id: 2, title: "Let's solve our own problem", done: false }
        ],
        hash: '#/', // the "route" to display
        editing: 2, // edit the 3rd todo list item (which has id == 2)
        all_done: false,
        clicked: undefined,
        click_time: undefined
      };
      // render the ONE todo list item in "editing mode" based on model.editing:
      container.appendChild(
        render_item(model.todos[2], model, mock_signal()),
      );

      // test that the <li class="editing"> and <input class="edit"> was rendered:
      expect(document.querySelectorAll('.editing').length).toBe(1);
      expect(document.querySelectorAll('.edit').length).toBe(1);

      const editInput = document.querySelector('.edit') as HTMLInputElement;
      expect(editInput).toBeTruthy();
      expect(editInput.value).toBe(model.todos[2].title);
    }
  });
});

describe('5.2 Double-click an item <label> to edit it', () => {
  it('should enter editing mode on double-click', () => {
    const container = document.getElementById(id);
    expect(container).toBeTruthy();
    if (container) {
      elmish.empty(container);
    }
    localStorage.removeItem('todos-elmish_' + id);
    const model: TodoState = {
      todos: [
        { id: 0, title: "Make something people want.", done: false },
        { id: 1, title: "Let's solve our own problem", done: false }
      ],
      hash: '#/', // the "route" to display
      all_done: false,
      editing: undefined,
      clicked: undefined,
      click_time: undefined
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, update, view, id, subscriptions);
    const label = document.querySelectorAll('.view > label')[1] as HTMLLabelElement;
    // "double-click" i.e. click the <label> twice in quick succession:
    label.click();
    label.click();
    // confirm that we are now in editing mode:
    expect(document.querySelectorAll('.editing').length).toBe(1);
    const editInput = document.querySelector('.edit') as HTMLInputElement;
    expect(editInput).toBeTruthy();
    expect(editInput.value).toBe(model.todos[1].title);
  });
});

describe('5.2.2 Slow clicks do not count as double-click', () => {
  it('should not enter editing mode on slow clicks', (done) => {
    const container = document.getElementById(id);
    expect(container).toBeTruthy();
    if (container) {
      elmish.empty(container);
    }
    localStorage.removeItem('todos-elmish_' + id);
    const model: TodoState = {
      todos: [
        { id: 0, title: "Make something people want.", done: false },
        { id: 1, title: "Let's solve our own problem", done: false }
      ],
      hash: '#/', // the "route" to display
      all_done: false,
      editing: undefined,
      clicked: undefined,
      click_time: undefined
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, update, view, id, subscriptions);
    const label = document.querySelectorAll('.view > label')[1] as HTMLLabelElement;
    // "double-click" i.e. click the <label> twice in quick succession:
    label.click();
    setTimeout(() => {
      label.click();
      // confirm that we are not in editing mode:
      expect(document.querySelectorAll('.editing').length).toBe(0);
      done();
    }, 301);
  });
});

describe('5.3 [ENTER] Key in edit mode triggers SAVE action', () => {
  it('should save the edited todo item on ENTER key', () => {
    const container = document.getElementById(id);
    expect(container).toBeTruthy();
    if (container) {
      elmish.empty(container);
    }
    localStorage.removeItem('todos-elmish_' + id);
    const model: TodoState = {
      todos: [
        { id: 0, title: "Make something people want.", done: false },
        { id: 1, title: "Let's solve our own problem", done: false }
      ],
      hash: '#/', // the "route" to display
      editing: 1, // edit the 2nd todo list item (which has id == 1)
      all_done: false,
      clicked: undefined,
      click_time: undefined
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, update, view, id, subscriptions);
    const updated_title = "Do things that don't scale!  ";
    // apply the updated_title to the <input class="edit">:
    const editInput = document.querySelector('.edit') as HTMLInputElement;
    expect(editInput).toBeTruthy();
    editInput.value = updated_title;
    // trigger the [Enter] keyboard key to SAVE the edited todo:
    document.dispatchEvent(new KeyboardEvent('keyup', {'key': 'Enter'}));
    // confirm that the todo item title was updated to the updated_title:
    const label = document.querySelectorAll('.view > label')[1];
    expect(label).toBeTruthy();
    expect(label.textContent).toBe(updated_title.trim());
  });
});

describe('5.4 SAVE should remove the item if an empty text string was entered', () => {
  it('should remove the todo item if saved with empty text', () => {
    const container = document.getElementById(id);
    expect(container).toBeTruthy();
    if (container) {
      elmish.empty(container);
    }
    localStorage.removeItem('todos-elmish_' + id);
    const model: TodoState = {
      todos: [
        { id: 0, title: "Make something people want.", done: false },
        { id: 1, title: "Let's solve our own problem", done: false }
      ],
      hash: '#/', // the "route" to display
      editing: 1, // edit the 2nd todo list item (which has id == 1)
      all_done: false,
      clicked: undefined,
      click_time: undefined
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, update, view, id, subscriptions);
    expect(document.querySelectorAll('.view').length).toBe(2);
    // apply empty string to the <input class="edit">:
    const editInput = document.querySelector('.edit') as HTMLInputElement;
    expect(editInput).toBeTruthy();
    editInput.value = '';
    // trigger the [Enter] keyboard key to SAVE the edited todo:
    document.dispatchEvent(new KeyboardEvent('keyup', {'key': 'Enter'}));
    // confirm that the todo item was removed!
    expect(document.querySelectorAll('.view').length).toBe(1);
  });
});

describe('5.5 CANCEL should cancel edits on escape', () => {
  it('should cancel edits when ESC key is pressed', () => {
    const container = document.getElementById(id);
    expect(container).toBeTruthy();
    if (container) {
      elmish.empty(container);
    }
    localStorage.removeItem('todos-elmish_' + id);
    const model: TodoState = {
      todos: [
        { id: 0, title: "Make something people want.", done: false },
        { id: 1, title: "Let's solve our own problem", done: false }
      ],
      hash: '#/', // the "route" to display
      editing: 1, // edit the 2nd todo list item (which has id == 1)
      all_done: false,
      clicked: undefined,
      click_time: undefined
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, update, view, id, subscriptions);
    const originalLabel = document.querySelectorAll('.view > label')[1];
    expect(originalLabel).toBeTruthy();
    expect(originalLabel.textContent).toBe(model.todos[1].title);
    // apply new text to the <input class="edit">:
    const editInput = document.querySelector('.edit') as HTMLInputElement;
    expect(editInput).toBeTruthy();
    editInput.value = 'Hello World';
    // trigger the [esc] keyboard key to CANCEL editing
    document.dispatchEvent(new KeyboardEvent('keyup', {'key': 'Escape'}));
    // confirm the item.title is still the original title:
    const newLabel = document.querySelectorAll('.view > label')[1];
    expect(newLabel).toBeTruthy();
    expect(newLabel.textContent).toBe(model.todos[1].title);
    localStorage.removeItem('todos-elmish_' + id);
  });
});

describe('6. Counter', () => {
  it('should display the current number of todo items', () => {
    const container = document.getElementById(id);
    expect(container).toBeTruthy();
    if (container) {
      elmish.empty(container);
    }
    const model: TodoState = {
      todos: [
        { id: 0, title: "Make something people want.", done: false },
        { id: 1, title: "Bootstrap for as long as you can", done: false },
        { id: 2, title: "Let's solve our own problem", done: false }
      ],
      hash: '#/',
      all_done: false,
      editing: undefined,
      clicked: undefined,
      click_time: undefined
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, update, view, id, subscriptions);
    // count:
    const countElement = document.getElementById('count');
    expect(countElement).toBeTruthy();
    const count = parseInt(countElement!.textContent || '0', 10);
    expect(count).toBe(model.todos.length);

    if (container) {
      elmish.empty(container); // clear DOM ready for next test
    }
    localStorage.removeItem('todos-elmish_' + id);
  });
});

describe('7. Clear Completed', () => {
  it('should display the number of completed items', () => {
    const container = document.getElementById(id);
    expect(container).toBeTruthy();
    if (container) {
      elmish.empty(container);
    }
    const model: TodoState = {
      todos: [
        { id: 0, title: "Make something people want.", done: false },
        { id: 1, title: "Bootstrap for as long as you can", done: true },
        { id: 2, title: "Let's solve our own problem", done: true }
      ],
      hash: '#/',
      all_done: false,
      editing: undefined,
      clicked: undefined,
      click_time: undefined
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, update, view, id, subscriptions);
    // count todo items in DOM:
    expect(document.querySelectorAll('.view').length).toBe(3);

    // count completed items
    const completedCountElement = document.getElementById('completed-count');
    expect(completedCountElement).toBeTruthy();
    const completed_count = parseInt(completedCountElement!.textContent || '0', 10);
    const done_count = model.todos.filter((i: Todo) => i.done).length;
    expect(completed_count).toBe(done_count);

    // clear completed items:
    const button = document.querySelector('.clear-completed') as HTMLButtonElement;
    expect(button).toBeTruthy();
    button.click();

    // confirm that there is now only ONE todo list item in the DOM:
    expect(document.querySelectorAll('.view').length).toBe(1);

    // no clear completed button in the DOM when there are no "done" todo items:
    expect(document.querySelectorAll('.clear-completed').length).toBe(0);

    if (container) {
      elmish.empty(container); // clear DOM ready for next test
    }
    localStorage.removeItem('todos-elmish_' + id);
  });
});

describe('8. Persistence', () => {
  it('should persist its data', () => {
    const container = document.getElementById(id);
    expect(container).toBeTruthy();
    if (container) {
      elmish.empty(container);
    }
    const model: TodoState = {
      todos: [
        { id: 0, title: "Make something people want.", done: false }
      ],
      hash: '#/',
      all_done: false,
      editing: undefined,
      clicked: undefined,
      click_time: undefined
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, update, view, id, subscriptions);
    // confirm that the model is saved to localStorage
    expect(localStorage.getItem('todos-elmish_' + id)).toBe(
      JSON.stringify(model));

    if (container) {
      elmish.empty(container); // clear DOM ready for next test
    }
    localStorage.removeItem('todos-elmish_' + id);
  });
});

describe('9. Routing', () => {
  it('should allow me to display active/completed/all items', () => {
    localStorage.removeItem('todos-elmish_' + id);
    const container = document.getElementById(id);
    expect(container).toBeTruthy();
    if (container) {
      elmish.empty(container);
    }
    const model: TodoState = {
      todos: [
        { id: 0, title: "Make something people want.", done: false },
        { id: 1, title: "Bootstrap for as long as you can", done: true },
        { id: 2, title: "Let's solve our own problem", done: true }
      ],
      hash: '#/active', // ONLY ACTIVE items
      all_done: false,
      editing: undefined,
      clicked: undefined,
      click_time: undefined
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, update, view, id, subscriptions);
    const mod = update('ROUTE', model);

    expect(document.querySelectorAll('.view').length).toBe(1);
    let selected = document.querySelector('.selected') as HTMLElement;
    expect(selected).toBeTruthy();
    expect(selected.id).toBe('active');

    // empty:
    if (container) {
      elmish.empty(container);
    }
    localStorage.removeItem('todos-elmish_' + id);
    // show COMPLETED items:
    model.hash = '#/completed';
    elmish.mount(model, update, view, id, subscriptions);
    expect(document.querySelectorAll('.view').length).toBe(2);
    selected = document.querySelector('.selected') as HTMLElement;
    expect(selected).toBeTruthy();
    expect(selected.id).toBe('completed');

    // empty:
    if (container) {
      elmish.empty(container);
    }
    localStorage.removeItem('todos-elmish_' + id);
    // show ALL items:
    model.hash = '#/';
    elmish.mount(model, update, view, id, subscriptions);
    expect(document.querySelectorAll('.view').length).toBe(3);
    selected = document.querySelector('.selected') as HTMLElement;
    expect(selected).toBeTruthy();
    expect(selected.id).toBe('all');

    if (container) {
      elmish.empty(container); // clear DOM ready for next test
    }
    localStorage.removeItem('todos-elmish_' + id);
  });
});
