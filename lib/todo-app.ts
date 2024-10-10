import { TodoAction, TodoModel, Todo, TodoUpdateFunction, TodoViewFunction, TodoSubscriptionsFunction } from './types';
import { a, button, div, empty, footer, input, h1, header, label, li, mount,
  route, section, span, strong, text, ul } from './elmish';

// Remove the 'export' keyword to avoid redeclaration
const initial_model: TodoModel = {
  todos: [],
  hash: "#/"
}

export const update: TodoUpdateFunction = (action, model, data?) => {
  const new_model: TodoModel = JSON.parse(JSON.stringify(model)) // "clone" the model

  switch(action) {
    case 'ADD':
      new_model.todos = new_model.todos || [];
      const last = new_model.todos.length > 0 ? new_model.todos[new_model.todos.length - 1] : null;
      const id = last ? last.id + 1 : 1;
      const input = document.getElementById('new-todo') as HTMLInputElement;
      new_model.todos.push({
        id: id,
        title: data || input.value.trim(),
        done: false
      });
      break;
    case 'TOGGLE':
      new_model.todos.forEach(function (item) { // takes 1ms on a "slow mobile"
        if(item.id === data) {    // this should only "match" one item.
          item.done = !item.done; // invert state of "done" e.g false >> true
        }
      });
      // if all todos are done=true then "check" the "toggle-all" checkbox:
      const all_done = new_model.todos.filter(function(item) {
        return item.done === false; // only care about items that are NOT done
      }).length;
      new_model.all_done = all_done === 0;
      break;
    case 'TOGGLE_ALL':
      new_model.all_done = !new_model.all_done;
      new_model.todos.forEach(function (item) { // takes 1ms on a "slow mobile"
        item.done = new_model.all_done ?? false;
      });
      break;
    case 'DELETE':
      // console.log('DELETE', data);
      new_model.todos = new_model.todos.filter(function (item) {
        return item.id !== data;
      });
      break;
    case 'EDIT':
      // this code is inspired by: https://stackoverflow.com/a/16033129/1148249
      // simplified as we are not altering the DOM!
      if (new_model.clicked && new_model.clicked === data &&
        Date.now() - 300 < new_model.click_time!) { // DOUBLE-CLICK < 300ms
          new_model.editing = data;
      }
      else { // first click
        new_model.clicked = data; // so we can check if same item clicked twice!
        new_model.click_time = Date.now(); // timer to detect double-click 300ms
        new_model.editing = undefined; // reset
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
        return update('DELETE', new_model, editId);
      }
      // update the value of the item.title that has been edited:
      new_model.todos = new_model.todos.map(function (item) {
        if (item.id === editId && value && value.length > 0) {
          item.title = value.trim();
        }
        return item; // return all todo items.
      });
      break;
    case 'CANCEL':
      new_model.clicked = undefined;
      new_model.editing = undefined;
      break;
    case 'CLEAR_COMPLETED':
      new_model.todos = new_model.todos.filter(function (item) {
        return !item.done; // only return items which are item.done = false
      });
      break;
    case 'ROUTE':
      new_model.hash = window.location.hash;
      break;
    default:
      return model;
  }
  return new_model;
}

function render_item (item: Todo, model: TodoModel, signal: (action: TodoAction, data?: any) => void): HTMLElement {
  return (
    li([
      "data-id=" + item.id,
      "id=" + item.id,
      item.done ? "class=completed" : "",
      model && model.editing && model.editing === item.id ? "class=editing" : ""
    ], [
      div(["class=view"], [
        input([
          item.done ? "checked=true" : "",
          "class=toggle",
          "type=checkbox",
          "onclick=" + (() => signal('TOGGLE', item.id))
        ], []),
        label(["ondblclick=" + (() => signal('EDIT', item.id))],
          [text(item.title) as any as HTMLElement]),
        button(["class=destroy",
          "onclick=" + (() => signal('DELETE', item.id))], [])
        ]
      ),
    ].concat(model && model.editing && model.editing === item.id ? [
      input(["class=edit", "id=" + item.id, "value=" + item.title, "autofocus"], [])
    ] : []) as HTMLElement[]
    )
  )
}

function render_main (model: TodoModel, signal: (action: TodoAction, data?: any) => void): HTMLElement {
  // Requirement #1 - No Todos, should hide #footer and #main
  const display = "style=display:"
    + (model.todos && model.todos.length > 0 ? "block" : "none");

  return (
    section(["class=main", "id=main", display], [
      input(["id=toggle-all", "type=checkbox",
        "onclick=" + (() => signal('TOGGLE_ALL')),
        (model.all_done ? "checked=checked" : ""),
        "class=toggle-all"
      ], []),
      label(["for=toggle-all"], [ text("Mark all as complete") as any as HTMLElement ]),
      ul(["class=todo-list"],
        (model.todos && model.todos.length > 0) ?
        model.todos
        .filter(function (item) {
          switch(model.hash) {
            case '#/active':
              return !item.done;
            case '#/completed':
              return item.done;
            default: // if hash doesn't match Active/Completed render ALL todos:
              return true;
          }
        })
        .map(function (item) {
          return render_item(item, model, signal)
        }) : []
      )
    ])
  )
}

function render_footer (model: TodoModel, signal: (action: TodoAction, data?: any) => void): HTMLElement {
  // count how many "active" (not yet done) items by filtering done === false:
  const done = (model.todos && model.todos.length > 0) ?
    model.todos.filter( function (i) { return i.done; }).length : 0;
  const count = (model.todos && model.todos.length > 0) ?
    model.todos.filter( function (i) { return !i.done; }).length : 0;

  // Requirement #1 - No Todos, should hide #footer and #main
  const display = (count > 0 || done > 0) ? "block" : "none";

  // number of completed items:
  const display_clear =  (done > 0) ? "block;" : "none;";

  // pluralization of number of items:
  const left = (" item" + ( count > 1 || count === 0 ? 's' : '') + " left");

  return (
    footer(["class=footer", "id=footer", "style=display:" + display], [
      span(["class=todo-count", "id=count"], [
        strong([], [text(count.toString()) as any as HTMLElement]),
        text(left) as any as HTMLElement
      ]),
      ul(["class=filters"], [
        li([], [
          a([
            "href=#/", "id=all", "class=" +
            (model.hash === '#/' ? "selected" : '')
          ],
          [text("All") as any as HTMLElement])
        ]),
        li([], [
          a([
            "href=#/active", "id=active", "class=" +
            (model.hash === '#/active' ? "selected" : '')
          ],
          [text("Active") as any as HTMLElement])
        ]),
        li([], [
          a([
            "href=#/completed", "id=completed", "class=" +
            (model.hash === '#/completed' ? "selected" : '')
          ],
          [text("Completed") as any as HTMLElement])
        ])
      ]), // </ul>
      button(["class=clear-completed", "style=display:" + display_clear,
        "onclick=" + (() => signal('CLEAR_COMPLETED'))
      ],
      [
        text("Clear completed [") as any as HTMLElement,
        strong([], [text(done.toString()) as any as HTMLElement]),
        text("]") as any as HTMLElement
      ])
    ])
  )
}

export const view: TodoViewFunction = (model, signal) => {
  return (
    section(["class=todoapp"], [ // array of "child" elements
      header(["class=header"], [
        h1([], [
          text("todos") as any as HTMLElement
        ]), // </h1>
        input([
          "id=new-todo",
          "class=new-todo",
          "placeholder=What needs to be done?",
          "autofocus",
          "onkeypress=" + ((e: KeyboardEvent) => {
            if (e.key === 'Enter') {
              const input = e.target as HTMLInputElement;
              if (input.value.trim()) {
                signal('ADD', input.value.trim());
                input.value = '';
              }
            }
          })
        ], []) // <input> is "self-closing"
      ]), // </header>
      render_main(model, signal),
      render_footer(model, signal)
    ]) // <section>
  );
}

export const subscriptions: TodoSubscriptionsFunction = (signal) => {
	const ENTER_KEY = 13; // add a new todo item when [Enter] key is pressed
	const ESCAPE_KEY = 27; // used for "escaping" when editing a Todo item

  document.addEventListener('keyup', function handler (e: KeyboardEvent) {
    // console.log('e.keyCode:', e.keyCode, '| key:', e.key);

    switch(e.keyCode) {
      case ENTER_KEY:
        const editing = document.getElementsByClassName('editing');
        if (editing && editing.length > 0) {
          signal('SAVE');
        }

        const new_todo = document.getElementById('new-todo') as HTMLInputElement;
        if(new_todo.value.length > 0) {
          signal('ADD');
          new_todo.value = ''; // reset <input> so we can add another todo
          document.getElementById('new-todo')!.focus();
        }
        break;
      case ESCAPE_KEY:
        signal('CANCEL');
        break;
    }
  });

  window.onhashchange = function route () {
    signal('ROUTE');
  }
}

export { render_item, render_main, render_footer, initial_model };
