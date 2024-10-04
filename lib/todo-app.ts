/* if require fn is available, it means we are in Node.js Land i.e. testing! */
/* istanbul ignore next */
import * as elmish from './elmish';

interface Todo {
  id: number;
  title: string;
  done: boolean;
}

interface TodoModel {
  todos: Todo[];
  hash: string;
  clicked?: number;
  click_time?: number;
  editing?: number;
  all_done: boolean;
}

export const initial_model: TodoModel = {
  todos: [],
  hash: "#/",
  all_done: false
};

// Ensure the module is initialized
console.log('todo-app module initialized');

/**
 * `update` transforms the `model` based on the `action`.
 * @param {String} action - the desired action to perform on the model.
 * @param {TodoModel} model - the App's (current) model (or "state").
 * @param {any} data - the data we want to "apply" to the item.
 * @return {TodoModel} new_model - the transformed model.
 */
export function updateTodoModel(action: string, model: TodoModel, data?: any): TodoModel {
  console.log('updateTodoModel - Action:', action, 'Data:', data);
  console.log('updateTodoModel - Before update:', JSON.stringify(model));
  const new_model: TodoModel = JSON.parse(JSON.stringify(model)) // "clone" the model

  switch(action) {
    case 'ADD':
      const last = (model.todos.length > 0) ? model.todos[model.todos.length - 1] : null;
      const id = last ? last.id + 1 : 1;
      const input = document.getElementById('new-todo') as HTMLInputElement;
      new_model.todos = new_model.todos || [];
      const newTodo = {
        id: id,
        title: data || (input ? input.value.trim() : ''),
        done: false
      };
      new_model.todos.push(newTodo);
      if (input) {
        input.value = ''; // Clear the input after adding a todo item
      }
      console.log('ADD - New todo added:', JSON.stringify(newTodo));
      break;
    case 'TOGGLE':
      new_model.todos.forEach(function (item: Todo) { // takes 1ms on a "slow mobile"
        if(item.id === data) {    // this should only "match" one item.
          item.done = !item.done; // invert state of "done" e.g false >> true
          console.log('TOGGLE - Todo toggled:', JSON.stringify(item));
        }
      });
      // if all todos are done=true then "check" the "toggle-all" checkbox:
      const all_done = new_model.todos.filter(function(item: Todo) {
        return item.done === false; // only care about items that are NOT done
      }).length;
      new_model.all_done = all_done === 0;
      console.log('TOGGLE - All done:', new_model.all_done);
      break;
    case 'TOGGLE_ALL':
      new_model.all_done = !new_model.all_done;
      new_model.todos.forEach(function (item: Todo) { // takes 1ms on a "slow mobile"
        item.done = new_model.all_done ?? false;
      });
      console.log('TOGGLE_ALL - All todos set to:', new_model.all_done);
      break;
    case 'DELETE':
      console.log('DELETE - Before:', JSON.stringify(new_model.todos));
      new_model.todos = new_model.todos.filter(function (item) {
        return item.id !== data;
      });
      console.log('DELETE - After:', JSON.stringify(new_model.todos));
      break;
    case 'EDIT':
      // this code is inspired by: https://stackoverflow.com/a/16033129/1148249
      // simplified as we are not altering the DOM!
      if (new_model.clicked && new_model.clicked === data &&
        Date.now() - 300 < (new_model.click_time ?? 0)) { // DOUBLE-CLICK < 300ms
          new_model.editing = data;
          console.log('EDIT - Double-click detected, editing:', data);
      }
      else { // first click
        new_model.clicked = data; // so we can check if same item clicked twice!
        new_model.click_time = Date.now(); // timer to detect double-click 300ms
        new_model.editing = undefined; // reset
        console.log('EDIT - First click detected:', data);
      }
      break;
    case 'SAVE':
      const edit = document.getElementsByClassName('edit')[0] as HTMLInputElement;
      const value = edit.value;
      const editId = parseInt(edit.id, 10);
      // End Editing
      new_model.clicked = undefined;
      new_model.editing = undefined;

      if (!value || value.length === 0) { // delete item if title is blank:
        console.log('SAVE - Deleting item due to empty title');
        return updateTodoModel('DELETE', new_model, editId);
      }
      // update the value of the item.title that has been edited:
      new_model.todos = new_model.todos.map(function (item) {
        if (item.id === editId && value && value.length > 0) {
          item.title = value.trim();
          console.log('SAVE - Updated todo:', JSON.stringify(item));
        }
        return item; // return all todo items.
      });
      break;
    case 'CANCEL':
      new_model.clicked = undefined;
      new_model.editing = undefined;
      console.log('CANCEL - Edit cancelled');
      break;
    case 'CLEAR_COMPLETED':
      console.log('CLEAR_COMPLETED - Before:', JSON.stringify(new_model.todos));
      new_model.todos = new_model.todos.filter(function (item) {
        return !item.done; // only return items which are item.done = false
      });
      console.log('CLEAR_COMPLETED - After:', JSON.stringify(new_model.todos));
      break;
    case 'ROUTE':
      new_model.hash = // (window && window.location && window.location.hash) ?
        window.location.hash // : '#/';
      console.log('ROUTE - New hash:', new_model.hash);
      break;
    default: // if action unrecognised or undefined,
      console.log('Unknown action:', action);
      return model; // return model unmodified
  }   // see: https://softwareengineering.stackexchange.com/a/201786/211301
  console.log('updateTodoModel - After update:', JSON.stringify(new_model));
  return new_model;
}

/**
 * `render_item` creates an DOM "tree" with a single Todo List Item
 * using the "elmish" DOM functions (`li`, `div`, `input`, `label` and `button`)
 * returns an `<li>` HTML element with a nested `<div>` which in turn has the:
 * + `<input type=checkbox>` which lets users to "Toggle" the status of the item
 * + `<label>` which displays the Todo item text (`title`) in a `<text>` node
 * + `<button class="destroy">` lets people "delete" a todo item.
 * see: https://github.com/dwyl/learn-elm-architecture-in-javascript/issues/52
 * @param  {Todo} item the todo item object
 * @param {Model} model - the App's (current) model (or "state").
 * @param {Function} signal - the Elm Architecture "dispatcher" which will run
 * @return {Object} <li> DOM Tree which is nested in the <ul>.
 * @example
 * // returns <li> DOM element with <div>, <input>. <label> & <button> nested
 * var DOM = render_item({id: 1, title: "Build Todo List App", done: false});
 */
function render_item (item: Todo, model: TodoModel, signal: Function): HTMLElement {
  const liElement = document.createElement('li');
  liElement.dataset.id = item.id.toString();
  liElement.id = item.id.toString();
  if (item.done) liElement.classList.add('completed');
  if (model.editing === item.id) liElement.classList.add('editing');

  const viewDiv = document.createElement('div');
  viewDiv.className = 'view';

  const toggleInput = document.createElement('input');
  toggleInput.className = 'toggle';
  toggleInput.type = 'checkbox';
  toggleInput.checked = item.done;
  if (typeof signal === 'function') {
    toggleInput.onclick = () => signal('TOGGLE', item.id);
  }

  const titleLabel = document.createElement('label');
  titleLabel.textContent = item.title;
  if (typeof signal === 'function') {
    titleLabel.ondblclick = () => signal('EDIT', item.id);
  }

  const destroyButton = document.createElement('button');
  destroyButton.className = 'destroy';
  if (typeof signal === 'function') {
    destroyButton.onclick = () => signal('DELETE', item.id);
  }

  viewDiv.appendChild(toggleInput);
  viewDiv.appendChild(titleLabel);
  viewDiv.appendChild(destroyButton);
  liElement.appendChild(viewDiv);

  if (model.editing === item.id) {
    const editInput = document.createElement('input');
    editInput.className = 'edit';
    editInput.id = item.id.toString();
    editInput.value = item.title;
    editInput.autofocus = true;
    liElement.appendChild(editInput);
  }

  return liElement;
}

/**
 * `render_main` renders the `<section class="main">` of the Todo List App
 * which contains all the "main" controls and the `<ul>` with the todo items.
 * @param {TodoModel} model - the App's (current) model (or "state").
 * @param {Function} signal - the Elm Architecture "dispatcher" which will run
 * @return {HTMLElement} <section> DOM Tree which containing the todo list <ul>, etc.
 */
function render_main (model: TodoModel, signal: Function): HTMLElement {
  // Requirement #1 - No Todos, should hide #footer and #main
  const display = model.todos && model.todos.length > 0 ? "block" : "none";

  const mainSection = document.createElement('section');
  mainSection.className = 'main';
  mainSection.id = 'main';
  mainSection.style.display = display;

  const toggleAllInput = document.createElement('input');
  toggleAllInput.id = 'toggle-all';
  toggleAllInput.type = 'checkbox';
  toggleAllInput.className = 'toggle-all';
  if (model.all_done) toggleAllInput.checked = true;
  if (typeof signal === 'function') {
    toggleAllInput.onclick = () => signal('TOGGLE_ALL');
  }

  const toggleAllLabel = document.createElement('label');
  toggleAllLabel.htmlFor = 'toggle-all';
  toggleAllLabel.textContent = 'Mark all as complete';

  const todoList = document.createElement('ul');
  todoList.className = 'todo-list';

  if (model.todos && model.todos.length > 0) {
    const filteredTodos = model.todos.filter(function (item) {
      switch(model.hash) {
        case '#/active':
          return !item.done;
        case '#/completed':
          return item.done;
        default: // if hash doesn't match Active/Completed render ALL todos:
          return true;
      }
    });

    filteredTodos.forEach(function (item) {
      todoList.appendChild(render_item(item, model, signal));
    });
  }

  mainSection.appendChild(toggleAllInput);
  mainSection.appendChild(toggleAllLabel);
  mainSection.appendChild(todoList);

  return mainSection;
}

/**
 * `render_footer` renders the `<footer class="footer">` of the Todo List App
 * which contains count of items to (still) to be done and a `<ul>` "menu"
 * with links to filter which todo items appear in the list view.
 * @param {TodoModel} model - the App's (current) model (or "state").
 * @param {Function} signal - the Elm Architecture "dispatcher" which will run
 * @return {HTMLElement} <footer> DOM element containing the footer content.
 * @example
 * // returns <footer> DOM element with other DOM elements nested:
 * var DOM = render_footer(model);
 */
function render_footer (model: TodoModel, signal: Function): HTMLElement {

  // count how many "active" (not yet done) items by filtering done === false:
  const done = (model.todos && model.todos.length > 0) ?
    model.todos.filter( function (i: Todo) { return i.done; }).length : 0;
  const count = (model.todos && model.todos.length > 0) ?
    model.todos.filter( function (i: Todo) { return !i.done; }).length : 0;

  // Requirement #1 - No Todos, should hide #footer and #main
  const display = (count > 0 || done > 0) ? "block" : "none";

  // number of completed items:
  const display_clear =  (done > 0) ? "block" : "none";

  // pluralization of number of items:
  const left = (" item" + ( count > 1 || count === 0 ? 's' : '') + " left");

  const footerElement = document.createElement('footer');
  footerElement.className = 'footer';
  footerElement.id = 'footer';
  footerElement.style.display = display;

  const todoCount = document.createElement('span');
  todoCount.className = 'todo-count';
  todoCount.id = 'count';
  const strongCount = document.createElement('strong');
  strongCount.textContent = count.toString();
  todoCount.appendChild(strongCount);
  todoCount.appendChild(document.createTextNode(left));

  const filters = document.createElement('ul');
  filters.className = 'filters';

  const filterItems = [
    { href: '#/', id: 'all', text: 'All' },
    { href: '#/active', id: 'active', text: 'Active' },
    { href: '#/completed', id: 'completed', text: 'Completed' }
  ];

  filterItems.forEach(item => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = item.href;
    a.id = item.id;
    a.className = model.hash === item.href ? 'selected' : '';
    a.textContent = item.text;
    li.appendChild(a);
    filters.appendChild(li);
  });

  const clearCompletedButton = document.createElement('button');
  clearCompletedButton.className = 'clear-completed';
  clearCompletedButton.style.display = display_clear;
  if (typeof signal === 'function') {
    clearCompletedButton.onclick = () => signal('CLEAR_COMPLETED');
  }
  clearCompletedButton.textContent = 'Clear completed [';
  const completedCount = document.createElement('span');
  completedCount.id = 'completed-count';
  completedCount.textContent = done.toString();
  clearCompletedButton.appendChild(completedCount);
  clearCompletedButton.appendChild(document.createTextNode(']'));

  footerElement.appendChild(todoCount);
  footerElement.appendChild(filters);
  footerElement.appendChild(clearCompletedButton);

  return footerElement;
}

/**
 * `view` renders the entire Todo List App
 * which contains count of items to (still) to be done and a `<ul>` "menu"
 * with links to filter which todo items appear in the list view.
 * @param {TodoModel} model - the App's (current) model (or "state").
 * @param {Function} signal - the Elm Architecture "dispatcher" which will run
 * @return {HTMLElement} <section> DOM element containing all other DOM elements.
 * @example
 * // returns <section class="todo-app"> DOM element with other DOM els nested:
 * var DOM = view(model);
 */
function view (model: TodoModel, signal: Function): HTMLElement {
  console.log('View function called with model:', JSON.stringify(model));
  const todoApp = document.createElement('section');
  todoApp.className = 'todoapp';

  const header = document.createElement('header');
  header.className = 'header';

  const h1 = document.createElement('h1');
  h1.textContent = 'todos';

  const input = document.createElement('input');
  input.id = 'new-todo';
  input.className = 'new-todo';
  input.placeholder = 'What needs to be done?';
  input.autofocus = true;

  header.appendChild(h1);
  header.appendChild(input);

  todoApp.appendChild(header);
  todoApp.appendChild(render_main(model, signal));
  todoApp.appendChild(render_footer(model, signal));

  console.log('View function returning todoApp:', todoApp.outerHTML);
  console.log('DOM structure:', todoApp.innerHTML);
  return todoApp;
}

/**
 * `subscriptions` let us "listen" for events such as "key press" or "click".
 * and respond according to a pre-defined update/action.
 * @param {Function} signal - the Elm Architecture "dispatcher" which will run
 * both the "update" and "render" functions when invoked with signal(action)
 */
function subscriptions (signal: Function): void {
	const ENTER_KEY = 13; // add a new todo item when [Enter] key is pressed
	const ESCAPE_KEY = 27; // used for "escaping" when editing a Todo item

  document.addEventListener('keyup', function handler (e: KeyboardEvent) {
    // console.log('e.keyCode:', e.keyCode, '| key:', e.key);

    switch(e.keyCode) {
      case ENTER_KEY:
        const editing = document.getElementsByClassName('editing');
        if (editing && editing.length > 0) {
          signal('SAVE')(); // invoke signal inner callback
        }

        const new_todo = document.getElementById('new-todo') as HTMLInputElement;
        if(new_todo.value.length > 0) {
          signal('ADD')(); // invoke signal inner callback
          new_todo.value = ''; // reset <input> so we can add another todo
          document.getElementById('new-todo')!.focus();
        }
        break;
      case ESCAPE_KEY:
        signal('CANCEL')();
        break;
    }
  });

  window.onhashchange = function route () {
    signal('ROUTE')();
  }
}

/* istanbul ignore next */
export { Todo, TodoModel, updateTodoModel as update, render_item, render_main, render_footer, subscriptions, view };
