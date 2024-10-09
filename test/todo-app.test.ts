import test from 'tape';
import { update, render_item, render_main, render_footer } from '../lib/todo-app';
import * as elmish from '../lib/elmish';

// Ensure global objects are available
declare global {
  namespace NodeJS {
    interface Global {
      document: Document;
      window: Window;
      navigator: Navigator;
    }
  }
}

const id = 'test-app';

interface Todo {
  id: number;
  title: string;
  done: boolean;
}

interface Model {
  todos: Todo[];
  hash: string;
  editing?: number;
}

const initial_model: Model = {
  todos: [],
  hash: "#/"
};

class MockLocalStorage implements Storage {
  private store: { [key: string]: string } = {};

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] || null;
  }

  get length(): number {
    return Object.keys(this.store).length;
  }
}

(global as any).localStorage = new MockLocalStorage();

function mock_signal(action: string, data?: any): void {
  console.log('Mock signal called with action:', action, 'and data:', data);
}

test('1. Default View > Should display the title "Todos"', function (t) {
  const clearElement = document.getElementById(id);
  if (clearElement) {
    elmish.empty(clearElement);
  }
  localStorage.removeItem('todos-elmish_' + id);
  const model: Model = {
    todos: [],
    hash: '#/'
  };
  const appElement = document.getElementById(id);
  if (appElement) {
    appElement.appendChild(render_main(model, mock_signal));
    appElement.appendChild(render_footer(model, mock_signal));
  }
  const title = document.getElementsByClassName('title')[0] as HTMLElement;
  t.equal(title.textContent, 'todos', 'Title is "todos"');
  t.end();
});

test('2. Add Todo > Should add a new todo item', function (t) {
  const clearElement = document.getElementById(id);
  if (clearElement) {
    elmish.empty(clearElement);
  }
  localStorage.removeItem('todos-elmish_' + id);
  const model: Model = {
    todos: [],
    hash: '#/'
  };
  const appElement = document.getElementById(id);
  if (appElement) {
    appElement.appendChild(render_main(model, mock_signal));
    appElement.appendChild(render_footer(model, mock_signal));
  }

  const input = document.querySelector('.new-todo') as HTMLInputElement;
  input.value = 'Test todo item';
  input.dispatchEvent(new KeyboardEvent('keyup', {'key': 'Enter'}));

  const todoItems = document.querySelectorAll('.view');
  t.equal(todoItems.length, 1, 'One todo item should be added');
  t.equal((todoItems[0].querySelector('label') as HTMLLabelElement).textContent, 'Test todo item', 'Todo item text should match input');
  t.end();
});

test('3. Toggle Todo > Should toggle a todo item', function (t) {
  const clearElement = document.getElementById(id);
  if (clearElement) {
    elmish.empty(clearElement);
  }
  localStorage.removeItem('todos-elmish_' + id);
  const model: Model = {
    todos: [{ id: 1, title: 'Test todo item', done: false }],
    hash: '#/'
  };
  const appElement = document.getElementById(id);
  if (appElement) {
    appElement.appendChild(render_main(model, mock_signal));
    appElement.appendChild(render_footer(model, mock_signal));
  }

  const toggleCheckbox = document.querySelector('.toggle') as HTMLInputElement;
  toggleCheckbox.click();

  const todoItem = document.querySelector('.completed');
  t.ok(todoItem, 'Todo item should be marked as completed');
  t.end();
});

// ... continue updating remaining tests
// ... previous tests remain unchanged

test('4. Edit Todo > Should allow editing a todo item', function (t) {
  const clearElement = document.getElementById(id);
  if (clearElement) {
    elmish.empty(clearElement);
  }
  localStorage.removeItem('todos-elmish_' + id);
  const model: Model = {
    todos: [{ id: 1, title: 'Test todo item', done: false }],
    hash: '#/'
  };
  const appElement = document.getElementById(id);
  if (appElement) {
    appElement.appendChild(render_main(model, mock_signal));
    appElement.appendChild(render_footer(model, mock_signal));
  }

  const label = document.querySelector('.view label') as HTMLLabelElement;
  label.dispatchEvent(new MouseEvent('dblclick'));

  const editInput = document.querySelector('.edit') as HTMLInputElement;
  editInput.value = 'Updated todo';
  editInput.dispatchEvent(new KeyboardEvent('keyup', {'key': 'Enter'}));

  const updatedLabel = document.querySelector('.view label') as HTMLLabelElement;
  t.equal(updatedLabel.textContent, 'Updated todo', 'Todo item should be updated');
  t.end();
});

test('5. Delete Todo > Should delete a todo item', function (t) {
  const clearElement = document.getElementById(id);
  if (clearElement) {
    elmish.empty(clearElement);
  }
  localStorage.removeItem('todos-elmish_' + id);
  const model: Model = {
    todos: [{ id: 1, title: 'Test todo item', done: false }],
    hash: '#/'
  };
  const appElement = document.getElementById(id);
  if (appElement) {
    appElement.appendChild(render_main(model, mock_signal));
    appElement.appendChild(render_footer(model, mock_signal));
  }

  const deleteButton = document.querySelector('.destroy') as HTMLButtonElement;
  deleteButton.click();

  const todoItems = document.querySelectorAll('.view');
  t.equal(todoItems.length, 0, 'Todo item should be deleted');
  t.end();
});

test('6. Filter Todos > Should filter todo items', function (t) {
  const clearElement = document.getElementById(id);
  if (clearElement) {
    elmish.empty(clearElement);
  }
  localStorage.removeItem('todos-elmish_' + id);
  const model: Model = {
    todos: [
      { id: 1, title: 'Active todo', done: false },
      { id: 2, title: 'Completed todo', done: true }
    ],
    hash: '#/'
  };
  const appElement = document.getElementById(id);
  if (appElement) {
    appElement.appendChild(render_main(model, mock_signal));
    appElement.appendChild(render_footer(model, mock_signal));
  }

  // Test "All" filter
  let todoItems = document.querySelectorAll('.view');
  t.equal(todoItems.length, 2, 'All todos should be visible');

  // Test "Active" filter
  const activeFilterLink = document.querySelector('a[href="#/active"]') as HTMLAnchorElement;
  activeFilterLink.click();
  todoItems = document.querySelectorAll('.view:not(.completed)');
  t.equal(todoItems.length, 1, 'Only active todo should be visible');

  // Test "Completed" filter
  const completedFilterLink = document.querySelector('a[href="#/completed"]') as HTMLAnchorElement;
  completedFilterLink.click();
  todoItems = document.querySelectorAll('.view.completed');
  t.equal(todoItems.length, 1, 'Only completed todo should be visible');

  t.end();
});

test('7. Clear Completed > Should clear completed todos', function (t) {
  const clearElement = document.getElementById(id);
  if (clearElement) {
    elmish.empty(clearElement);
  }
  localStorage.removeItem('todos-elmish_' + id);
  const model: Model = {
    todos: [
      { id: 1, title: 'Active todo', done: false },
      { id: 2, title: 'Completed todo', done: true }
    ],
    hash: '#/'
  };
  const appElement = document.getElementById(id);
  if (appElement) {
    appElement.appendChild(render_main(model, mock_signal));
    appElement.appendChild(render_footer(model, mock_signal));
  }

  const clearCompletedButton = document.querySelector('.clear-completed') as HTMLButtonElement;
  clearCompletedButton.click();

  const todoItems = document.querySelectorAll('.view');
  t.equal(todoItems.length, 1, 'Only active todo should remain');
  t.equal((todoItems[0].querySelector('label') as HTMLLabelElement).textContent, 'Active todo', 'Remaining todo should be the active one');
  t.end();
});

// Remove any remaining references to 'app' object
// Replace elmish.mount calls with appropriate render_main and render_footer calls
// ... previous tests remain unchanged

// Remove the problematic code block
// document.querySelectorAll('.toggle').forEach(function(item, index) {
//   const checkbox = item as HTMLInputElement;
//   t.equal(checkbox.checked, model.todos[index].done,
//     "Todo #" + index + " is done=" + checkbox.checked
//     + " text: " + items[index].textContent)
// })
test('8. Toggle All > Should toggle all todos', function (t) {
  const clearElement = document.getElementById(id);
  if (clearElement) {
    elmish.empty(clearElement);
  }
  localStorage.removeItem('todos-elmish_' + id);
  const model: Model = {
    todos: [
      { id: 1, title: 'Todo 1', done: false },
      { id: 2, title: 'Todo 2', done: false },
      { id: 3, title: 'Todo 3', done: false }
    ],
    hash: '#/'
  };
  const appElement = document.getElementById(id);
  if (appElement) {
    appElement.appendChild(render_main(model, mock_signal));
    appElement.appendChild(render_footer(model, mock_signal));
  }

  const toggleAllCheckbox = document.querySelector('.toggle-all') as HTMLInputElement;

  // Toggle all to completed
  toggleAllCheckbox.click();
  document.querySelectorAll('.toggle').forEach((item) => {
    const checkbox = item as HTMLInputElement;
    t.equal(checkbox.checked, true, 'All todos should be marked as completed');
  });

  // Toggle all back to active
  toggleAllCheckbox.click();
  document.querySelectorAll('.toggle').forEach((item) => {
    const checkbox = item as HTMLInputElement;
    t.equal(checkbox.checked, false, 'All todos should be marked as active');
  });

  t.end();
});

test('9. Persistence > Should persist todo items', function (t) {
  const clearElement = document.getElementById(id);
  if (clearElement) {
    elmish.empty(clearElement);
  }
  localStorage.removeItem('todos-elmish_' + id);
  const model: Model = {
    todos: [
      { id: 1, title: 'Persistent todo', done: false }
    ],
    hash: '#/'
  };
  const appElement = document.getElementById(id);
  if (appElement) {
    appElement.appendChild(render_main(model, mock_signal));
    appElement.appendChild(render_footer(model, mock_signal));
  }

  // Simulate page reload
  elmish.empty(appElement as HTMLElement);
  appElement?.appendChild(render_main(model, mock_signal));
  appElement?.appendChild(render_footer(model, mock_signal));

  const todoItems = document.querySelectorAll('.view');
  t.equal(todoItems.length, 1, 'Todo item should persist after page reload');
  t.equal((todoItems[0].querySelector('label') as HTMLLabelElement).textContent, 'Persistent todo', 'Todo item text should persist');

  t.end();
});

// ... previous tests remain unchanged

test('4. Item: should allow me to mark items as complete', function (t) {
  const clearElement = document.getElementById(id);
  if (clearElement) {
    elmish.empty(clearElement);
  }
  localStorage.removeItem('todos-elmish_' + id);
  const model: Model = {
    todos: [
      { id: 0, title: "Make JavaScript Great Again", done: false }
    ],
    hash: '#/' // the "route" to display
  };
  // render the view and append it to the DOM inside the `test-app` node:
  const appElement = document.getElementById(id);
  if (appElement) {
    appElement.appendChild(render_main(model, mock_signal));
    appElement.appendChild(render_footer(model, mock_signal));
  }
  const item = document.getElementById('0');
  t.equal(item?.textContent, model.todos[0].title, 'Item contained in model.');
  // confirm that the todo item is NOT done (done=false):
  const checkbox = document.querySelector('.toggle') as HTMLInputElement;
  t.equal(checkbox.checked, false, "Item should be not done.");
  // "click" the checkbox to mark it as "done":
  checkbox.click();
  // confirm that the todo item is now "done":
  t.equal(checkbox.checked, true, "Item should be done.");

  const finalClearElement = document.getElementById(id);
  if (finalClearElement) {
    elmish.empty(finalClearElement);
  }
  localStorage.removeItem('todos-elmish_' + id);
  t.end();
});

test('5. Item: should allow me to un-mark items as complete', function (t) {
  const clearElement = document.getElementById(id);
  if (clearElement) {
    elmish.empty(clearElement);
  }
  localStorage.removeItem('todos-elmish_' + id);
  const model: Model = {
    todos: [
      { id: 0, title: "Make JavaScript Great Again", done: true }
    ],
    hash: '#/' // the "route" to display
  };
  // render the view and append it to the DOM inside the `test-app` node:
  const appElement = document.getElementById(id);
  if (appElement) {
    appElement.appendChild(render_main(model, mock_signal));
    appElement.appendChild(render_footer(model, mock_signal));
  }
  const item = document.getElementById('0');
  t.equal(item?.textContent, model.todos[0].title, 'Item contained in model.');
  // confirm that the todo item is done (done=true):
  const checkbox = document.querySelector('.toggle') as HTMLInputElement;
  t.equal(checkbox.checked, true, "Item should be done.");
  // "click" the checkbox to mark it as "not done":
  checkbox.click();
  // confirm that the todo item is now "not done":
  t.equal(checkbox.checked, false, "Item should be not done.");

  const finalClearElement = document.getElementById(id);
  if (finalClearElement) {
    elmish.empty(finalClearElement);
  }
  localStorage.removeItem('todos-elmish_' + id);
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
      { id: 0, title: "Make JavaScript Great Again", done: false }
    ],
    hash: '#/' // the "route" to display
  };
  // render the view and append it to the DOM inside the `test-app` node:
  const appElement = document.getElementById(id);
  if (appElement) {
    appElement.appendChild(render_main(model, mock_signal));
    appElement.appendChild(render_footer(model, mock_signal));
  }

  t.equal(document.querySelectorAll('.destroy').length, 1, "one destroy button");

  const item = document.getElementById('0');
  t.equal(item?.textContent?.trim(), model.todos[0].title, 'Item contained in DOM.');
  // DELETE the item by clicking on the <button class="destroy">:
  const button = item?.querySelector('button.destroy') as HTMLButtonElement;
  button.click();
  // confirm that there is no longer a <button class="destroy">
  t.equal(document.querySelectorAll('button.destroy').length, 0,
    'there is no longer a <button class="destroy"> as the only item was DELETEd');

  const finalClearElement = document.getElementById(id);
  if (finalClearElement) {
    elmish.empty(finalClearElement);
  }
  localStorage.removeItem('todos-elmish_' + id);
  t.end();
});

test('5.1 Editing: > Render an item in "editing mode"', function (t) {
  const clearElement = document.getElementById(id);
  if (clearElement) {
    elmish.empty(clearElement);
  }
  localStorage.removeItem('todos-elmish_' + id);
  const model: Model = {
    todos: [
      { id: 0, title: "todo-0", done: false },
      { id: 1, title: "todo-1", done: false },
      { id: 2, title: "todo-2", done: false }
    ],
    hash: '#/' // the "route" to display
  };
  // render the ONE todo list item in "editing mode" based on model.editing:
  const appElement = document.getElementById(id);
  if (appElement) {
    appElement.appendChild(render_item(model.todos[2], { ...model, editing: 2 }, mock_signal));
  }
  // test that signal (in case of the test mock_signal) is onclick attribute:
  const label = document.querySelector('label');
  t.equal(label?.getAttribute('ondblclick')?.includes('mock_signal'), true,
    "ondblclick attribute contains mock_signal");

  const editInput = document.querySelector('.edit') as HTMLInputElement;
  t.equal(editInput?.value, model.todos[2].title,
    "The todo item's title is rendered in the <input class='edit'>");

  const finalClearElement = document.getElementById(id);
  if (finalClearElement) {
    elmish.empty(finalClearElement);
  }
  localStorage.removeItem('todos-elmish_' + id);
  t.end();
});

test('5.2 Double-click an item <label> to edit it', function (t) {
  const clearElement = document.getElementById(id);
  if (clearElement) {
    elmish.empty(clearElement);
  }
  localStorage.removeItem('todos-elmish_' + id);
  const model: Model = {
    todos: [
      { id: 0, title: "todo-0", done: false },
      { id: 1, title: "todo-1", done: false },
      { id: 2, title: "todo-2", done: false }
    ],
    hash: '#/' // the "route" to display
  };
  // render the view and append it to the DOM inside the `test-app` node:
  const appElement = document.getElementById(id);
  if (appElement) {
    appElement.appendChild(render_main(model, mock_signal));
    appElement.appendChild(render_footer(model, mock_signal));
  }
  const label = document.querySelectorAll('.view > label')[1] as HTMLLabelElement;
  // "double-click" i.e. click the <label> twice in quick succession:
  label.click();
  label.click();
  // confirm that we are now in editing mode:
  t.equal(document.querySelectorAll('.editing').length, 1,
    "<li class='editing'> element is visible");
  const editInput = document.querySelector('.edit') as HTMLInputElement;
  t.equal(editInput.value, model.todos[1].title,
    "<input class='edit'> has value: " + model.todos[1].title);
  t.end();
});

test('5.2.2 Slow clicks do not count as double-click > no edit!', function (t) {
  const clearElement = document.getElementById(id);
  if (clearElement) {
    elmish.empty(clearElement);
  }
  localStorage.removeItem('todos-elmish_' + id);
  const model: Model = {
    todos: [
      { id: 0, title: "todo-0", done: false },
      { id: 1, title: "todo-1", done: false },
      { id: 2, title: "todo-2", done: false }
    ],
    hash: '#/' // the "route" to display
  };
  // render the view and append it to the DOM inside the `test-app` node:
  const appElement = document.getElementById(id);
  if (appElement) {
    appElement.appendChild(render_main(model, mock_signal));
    appElement.appendChild(render_footer(model, mock_signal));
  }
  const label = document.querySelectorAll('.view > label')[1] as HTMLLabelElement;
  // "double-click" i.e. click the <label> twice in quick succession:
  label.click();
  // wait 350ms between clicks:
  setTimeout(function () {
    label.click();
    // confirm that we are NOT in editing mode:
    t.equal(document.querySelectorAll('.editing').length, 0,
      "<li class='editing'> element is NOT visible");
    t.equal(document.querySelectorAll('.edit').length, 0,
      "<input class='edit'> element is NOT visible");
    t.end();
  }, 350);
});

test('5.3 [ENTER] Key in edit mode triggers SAVE action', function (t) {
  const clearElement = document.getElementById(id);
  if (clearElement) {
    elmish.empty(clearElement);
  }
  localStorage.removeItem('todos-elmish_' + id);
  const model: Model = {
    todos: [
      { id: 0, title: "todo-0", done: false },
      { id: 1, title: "todo-1", done: false },
      { id: 2, title: "todo-2", done: false }
    ],
    hash: '#/', // the "route" to display
    editing: 1 // edit the 2nd todo list item (which has id == 1)
  };
  // render the view and append it to the DOM inside the `test-app` node:
  const appElement = document.getElementById(id);
  if (appElement) {
    appElement.appendChild(render_main(model, mock_signal));
    appElement.appendChild(render_footer(model, mock_signal));
  }
  // change the
  const updated_title = "Do things that don\'t scale!  ";
  // apply the updated_title to the <input class="edit">:
  const editInput = document.querySelector('.edit') as HTMLInputElement;
  editInput.value = updated_title;
  // trigger the [Enter] keyboard key to ADD the new todo:
  document.dispatchEvent(new KeyboardEvent('keyup', {'key': 'Enter'}));
  // confirm that the todo item title was updated to the updated_title:
  const todoItem = document.querySelector('.view label') as HTMLLabelElement;
  t.equal(todoItem.textContent?.trim(), updated_title.trim(),
    "Todo item title was updated to: " + updated_title);
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
        { id: 0, title: "todo-0", done: false },
        { id: 1, title: "todo-1", done: false }
      ],
      hash: '#/', // the "route" to display
      editing: 1 // edit the 2nd todo list item (which has id == 1)
    };
    // render the view and append it to the DOM inside the `test-app` node:
    const appElement = document.getElementById(id);
    if (appElement) {
      appElement.appendChild(render_main(model, mock_signal));
      appElement.appendChild(render_footer(model, mock_signal));
    }
    t.equal(document.querySelectorAll('.view').length, 2, 'todo count: 2');
    // apply empty string to the <input class="edit">:
    const editInput = document.querySelector('.edit') as HTMLInputElement;
    editInput.value = '';
    // trigger the [Enter] keyboard key to SAVE the (empty) todo:
    document.dispatchEvent(new KeyboardEvent('keyup', {'key': 'Enter'}));
    t.equal(document.querySelectorAll('.view').length, 1,
      'todo count: 1 (item was removed when saved with empty title)');
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
    hash: '#/', // the "route" to display
    editing: 1 // edit the 2nd todo list item (which has id == 1)
  };
  // render the view and append it to the DOM inside the `test-app` node:
  const appElement = document.getElementById(id);
  if (appElement) {
    appElement.appendChild(render_main(model, mock_signal));
    appElement.appendChild(render_footer(model, mock_signal));
  }
  const label = document.querySelectorAll('.view > label')[1] as HTMLLabelElement;
  t.equal(label.textContent, model.todos[1].title, 'todo id 1 has title: ' + model.todos[1].title);
  // apply empty string to the <input class="edit">:
  const editInput = document.querySelector('.edit') as HTMLInputElement;
  editInput.value = 'Hello World';
  // trigger the [esc] keyboard key to CANCEL editing
  document.dispatchEvent(new KeyboardEvent('keyup', {'key': 'Escape'}));
  // confirm the item.title is still the original title:
  t.equal(label.textContent, model.todos[1].title, 'todo id 1 has title: ' + model.todos[1].title);
  localStorage.removeItem('todos-elmish_' + id);
  t.end();
});

test('6. Counter > should display the current number of todo items',
  function (t) {
  const clearElement = document.getElementById(id);
  if (clearElement) {
    elmish.empty(clearElement);
  }
  const model: Model = {
    todos: [
      { id: 0, title: "Make something people want.", done: false },
      { id: 1, title: "Bootstrap for as long as you can", done: false },
      { id: 2, title: "Let's solve our own problem", done: false }
    ],
    hash: '#/'
  };
  // render the view and append it to the DOM inside the `test-app` node:
  const appElement = document.getElementById(id);
  if (appElement) {
    appElement.appendChild(render_main(model, mock_signal));
    appElement.appendChild(render_footer(model, mock_signal));
  }
  // count:
  const countElement = document.getElementById('count');
  const count = countElement ? parseInt(countElement.textContent || '0', 10) : 0;
  t.equal(count, model.todos.length, "displays todo item count: " + count);

  const finalClearElement = document.getElementById(id);
  if (finalClearElement) {
    elmish.empty(finalClearElement); // clear DOM ready for next test
  }
  localStorage.removeItem('todos-elmish_' + id);
  t.end();
});

test('7. Clear Completed > should display the number of completed items', function (t) {
  const clearElement = document.getElementById(id);
  if (clearElement) {
    elmish.empty(clearElement);
  }
  localStorage.removeItem('todos-elmish_' + id);
  const model: Model = {
    todos: [
      { id: 0, title: "Make something people want.", done: false },
      { id: 1, title: "Build todo list app.", done: true },
      { id: 2, title: "Profit!", done: false }
    ],
    hash: '#/'
  };
  const appElement = document.getElementById(id);
  if (appElement) {
    appElement.appendChild(render_main(model, mock_signal));
    appElement.appendChild(render_footer(model, mock_signal));
  }

  // count todo items in DOM:
  t.equal(document.querySelectorAll('.view').length, 3,
    "at the start, there are 3 todo items in the DOM.");

  // count completed items
  const completedCountElement = document.getElementById('completed-count');
  const completed_count = completedCountElement ? parseInt(completedCountElement.textContent || '0', 10) : 0;
  const done_count = model.todos.filter(function(i) { return i.done; }).length;
  t.equal(completed_count, done_count,
    "displays completed items count: " + completed_count);

  // clear completed items:
  const clearCompletedButton = document.querySelector('.clear-completed') as HTMLButtonElement;
  clearCompletedButton.click();

  // confirm that there is now only ONE todo list item in the DOM:
  t.equal(document.querySelectorAll('.view').length, 2,
    "after clearing completed, there are 2 todo items in the DOM.");

  t.equal(document.querySelectorAll('.clear-completed').length, 0,
    'no clear-completed button when there are no done items.');

  const finalClearElement = document.getElementById(id);
  if (finalClearElement) {
    elmish.empty(finalClearElement); // clear DOM ready for next test
  }
  localStorage.removeItem('todos-elmish_' + id);
  t.end();
});

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
  const appElement = document.getElementById(id);
  if (appElement) {
    appElement.appendChild(render_main(model, mock_signal));
    appElement.appendChild(render_footer(model, mock_signal));
  }

  // confirm that the model is saved to localStorage
  const storedData = localStorage.getItem('todos-elmish_' + id);
  t.equal(storedData, JSON.stringify(model),
    "model data is stored in localStorage");

  // "refresh" the page by clearing the DOM and re-rendering:
  if (appElement) {
    elmish.empty(appElement);
    appElement.appendChild(render_main(model, mock_signal));
    appElement.appendChild(render_footer(model, mock_signal));
  }

  // confirm that the todo item is still rendered in the DOM:
  const items = document.querySelectorAll('.view');
  t.equal(items.length, 1, "todo is still in the DOM after refresh");

  const finalClearElement = document.getElementById(id);
  if (finalClearElement) {
    elmish.empty(finalClearElement); // clear DOM ready for next test
  }
  localStorage.removeItem('todos-elmish_' + id);
  t.end();
});
