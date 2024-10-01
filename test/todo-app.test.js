import test from 'tape'; // https://github.com/dwyl/learn-tape
import fs from 'fs'; // to read html files (see below)
import path from 'path'; // so we can open files cross-platform
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'));
require('jsdom-global')(html); // https://github.com/rstacruz/jsdom-global
import * as app from 'todo-app'; // functions to test
const id = 'test-app'; // all tests use 'test-app' as root element
import * as elmish from '../lib/elmish.js'; // import "elmish" core functions
test('`model` (Object) has desired keys', function (t) {
    const initialModel = { todos: [], hash: '#/' };
    const keys = Object.keys(initialModel);
    t.deepEqual(keys, ['todos', 'hash'], "`todos` and `hash` keys are present.");
    t.true(Array.isArray(initialModel.todos), "model.todos is an Array");
    t.end();
});
test('`update` default case should return model unmodified', function (t) {
    const model = { todos: [], hash: '#/' };
    const unmodified_model = app.update('UNKNOWN_ACTION', model);
    t.deepEqual(model, unmodified_model, "model returned unmodified");
    t.end();
});
test('update `ADD` a new todo item to model.todos Array', function (t) {
    const model = { todos: [], hash: '#/' }; // initial state
    t.equal(model.todos.length, 0, "initial model.todos.length is 0");
    const updated_model = app.update('ADD', model);
    const expected = { id: 1, title: "", done: false };
    t.equal(updated_model.todos.length, 1, "updated_model.todos.length is 1");
    t.deepEqual(updated_model.todos[0], expected, "Todo list item added.");
    t.end();
});
test('update `TOGGLE` a todo item from done=false to done=true', function (t) {
    const model = { todos: [], hash: '#/' }; // initial state
    const model_with_todo = app.update('ADD', model);
    const item = model_with_todo.todos[0];
    if (item) {
        const model_todo_done = app.update('TOGGLE', model_with_todo);
        const expected = { id: 1, title: "", done: true };
        t.deepEqual(model_todo_done.todos[0], expected, "Todo list item Toggled.");
    }
    t.end();
});
test('`TOGGLE` (undo) a todo item from done=true to done=false', function (t) {
    const model = { todos: [], hash: '#/' }; // initial state
    const model_with_todo = app.update('ADD', model);
    const item = model_with_todo.todos[0];
    if (item) {
        const model_todo_done = app.update('TOGGLE', model_with_todo);
        const expected = { id: 1, title: "", done: true };
        t.deepEqual(model_todo_done.todos[0], expected, "Toggled done=false >> true");
        // add another item before "undoing" the original one:
        const model_second_item = app.update('ADD', model_todo_done);
        t.equal(model_second_item.todos.length, 2, "there are TWO todo items");
        // Toggle the original item such that: done=true >> done=false
        const model_todo_undone = app.update('TOGGLE', model_second_item);
        const undone = { id: 1, title: "", done: false };
        t.deepEqual(model_todo_undone.todos[0], undone, "Todo item Toggled > undone!");
    }
    t.end();
});
// this is used for testing view functions which require a signal function
function mock_signal() {
    return function inner_function() {
        console.log('done');
    };
}
test('render_item HTML for a single Todo Item', function (t) {
    const model = {
        todos: [
            { id: 1, title: "Learn Elm Architecture", done: true },
        ],
        hash: '#/' // the "route" to display
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
    const inputElement = document.querySelectorAll('input')[0];
    const checked = inputElement ? inputElement.checked : false;
    t.equal(checked, true, 'Done: ' + model.todos[0].title + " is done=true");
    const clearElement = document.getElementById(id);
    if (clearElement) {
        elmish.empty(clearElement); // clear DOM ready for next test
    }
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
    const element = document.getElementById(id);
    if (element) {
        const renderedItem = app.render_item(model.todos[0], model, () => { });
        if (renderedItem instanceof HTMLElement) {
            element.appendChild(renderedItem);
        }
    }
    const completedElement = document.querySelectorAll('.completed')[0];
    const done = completedElement ? completedElement.textContent : null;
    t.equal(done, 'Learn Elm Architecture', 'Done: Learn "TEA"');
    const inputElement = document.querySelectorAll('input')[0];
    const checked = inputElement ? inputElement.checked : false;
    t.equal(checked, true, 'Done: ' + model.todos[0].title + " is done=true");
    const clearElement = document.getElementById(id);
    if (clearElement) {
        elmish.empty(clearElement); // clear DOM ready for next test
    }
    t.end();
});
test('render_main "main" view using (elmish) HTML DOM functions', function (t) {
    const model = {
        todos: [
            { id: 1, title: "Learn Elm Architecture", done: true },
            { id: 2, title: "Build Todo List App", done: false },
            { id: 3, title: "Win the Internet!", done: false }
        ],
        hash: '#/' // the "route" to display
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
            t.equal(item.textContent, model.todos[index].title, "index #" + index + " <label> text: " + item.textContent);
        }
    });
    const inputs = document.querySelectorAll('input'); // todo items are 1,2,3
    [true, false, false].forEach(function (state, index) {
        const input = inputs[index + 1];
        if (input) {
            t.equal(input.checked, state, "Todo #" + index + " is done=" + state);
        }
    });
    const clearElement = document.getElementById(id);
    if (clearElement) {
        elmish.empty(clearElement); // clear DOM ready for next test
    }
    t.end();
});
test('render_footer view using (elmish) HTML DOM functions', function (t) {
    const model = {
        todos: [
            { id: 1, title: "Learn Elm Architecture", done: true },
            { id: 2, title: "Build Todo List App", done: false },
            { id: 3, title: "Win the Internet!", done: false }
        ],
        hash: '#/' // the "route" to display
    };
    // render_footer view and append it to the DOM inside the `test-app` node:
    const element = document.getElementById(id);
    if (element) {
        const renderedFooter = app.render_footer(model);
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
            t.equal(a.href.replace('about:blank', ''), hrefs[index], "<footer> link #" + index + " href is: " + hrefs[index]);
        }
    });
    // check for "Clear completed" button in footer:
    const clearCompletedElements = document.querySelectorAll('.clear-completed');
    const clearCompletedElement = clearCompletedElements[0];
    const clear = clearCompletedElement instanceof HTMLElement ? clearCompletedElement.textContent : '';
    t.equal(clear, 'Clear completed [1]', '<button> in <footer> "Clear completed [1]"');
    const clearElement = document.getElementById(id);
    if (clearElement) {
        elmish.empty(clearElement); // clear DOM ready for next test
    }
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
    const element = document.getElementById(id);
    if (element) {
        const renderedFooter = app.render_footer(model);
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
test('view renders the whole todo app using "partials"', function (t) {
    // render the view and append it to the DOM inside the `test-app` node:
    const element = document.getElementById(id);
    const model = { todos: [], hash: '#/' }; // initial model
    if (element) {
        element.appendChild(app.view(model));
    }
    const h1Element = document.querySelector('h1');
    t.equal(h1Element ? h1Element.textContent : '', "todos", "<h1>todos");
    // placeholder:
    const newTodoElement = document.getElementById('new-todo');
    const placeholder = newTodoElement ? newTodoElement.getAttribute("placeholder") : '';
    t.equal(placeholder, "What needs to be done?", "paceholder set on <input>");
    // todo-count should display 0 items left (based on initial_model):
    const countElement = document.getElementById('count');
    const left = countElement ? countElement.innerHTML : '';
    t.equal(left, "<strong>0</strong> items left", "Todos remaining: " + left);
    const clearElement = document.getElementById(id);
    if (clearElement) {
        elmish.empty(clearElement); // clear DOM ready for next test
    }
    t.end();
});
test('1. No Todos, should hide #footer and #main', function (t) {
    // render the view and append it to the DOM inside the `test-app` node:
    const element = document.getElementById(id);
    if (element) {
        element.appendChild(app.view({ todos: [], hash: '#/' })); // No Todos
    }
    const mainElement = document.getElementById('main');
    const main_display = mainElement ? window.getComputedStyle(mainElement) : null;
    t.equal(main_display === null || main_display === void 0 ? void 0 : main_display.display, 'none', "No Todos, hide #main");
    const footerElement = document.getElementById('footer');
    const main_footer = footerElement ? window.getComputedStyle(footerElement) : null;
    t.equal(main_footer === null || main_footer === void 0 ? void 0 : main_footer.display, 'none', "No Todos, hide #footer");
    const clearElement = document.getElementById(id);
    if (clearElement) {
        elmish.empty(clearElement); // clear DOM ready for next test
    }
    t.end();
});
// Testing localStorage requires "polyfil" because:a
// https://github.com/jsdom/jsdom/issues/1137 ¯\_(ツ)_/¯
// globals are usually bad! but a "necessary evil" here.
global.localStorage = global.localStorage ? global.localStorage : {
    _storage: {},
    get length() {
        return Object.keys(this._storage).length;
    },
    clear: function () {
        this._storage = {};
    },
    key: function (n) {
        return Object.keys(this._storage)[n] || null;
    },
    getItem: function (key) {
        return key in this._storage ? this._storage[key] : null;
    },
    setItem: function (key, value) {
        this._storage[key] = value;
    },
    removeItem: function (key) {
        delete this._storage[key];
    }
};
localStorage.removeItem('todos-elmish_store');
test('2. New Todo, should allow me to add todo items', function (t) {
    var _a, _b;
    const element = document.getElementById(id);
    if (element) {
        elmish.empty(element);
    }
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount({ todos: [], hash: '#/' }, app.update, app.view, id);
    const new_todo = document.getElementById('new-todo');
    if (new_todo) {
        // "type" content in the <input id="new-todo">:
        const todo_text = 'Make Everything Awesome!     '; // deliberate whitespace!
        new_todo.value = todo_text;
        // trigger the [Enter] keyboard key to ADD the new todo:
        document.dispatchEvent(new KeyboardEvent('keyup', { 'keyCode': 13 }));
        const items = document.querySelectorAll('.view');
        t.equal(items.length, 1, "should allow me to add todo items");
        // check if the new todo was added to the DOM:
        const actual = (_a = document.getElementById('1')) === null || _a === void 0 ? void 0 : _a.textContent;
        t.equal(todo_text.trim(), actual, "should trim text input");
        // subscription keyCode trigger "branch" test (should NOT fire the signal):
        const clone = (_b = document.getElementById(id)) === null || _b === void 0 ? void 0 : _b.cloneNode(true);
        document.dispatchEvent(new KeyboardEvent('keyup', { 'keyCode': 42 }));
        t.deepEqual(document.getElementById(id), clone, "#" + id + " no change");
        // check that the <input id="new-todo"> was reset after the new item was added
        t.equal(new_todo.value, '', "should clear text input field when an item is added");
        const main_display = window.getComputedStyle(document.getElementById('main'));
        t.equal('block', main_display.display, "should show #main and #footer when items added");
        const main_footer = window.getComputedStyle(document.getElementById('footer'));
        t.equal('block', main_footer.display, "item added, show #footer");
        elmish.empty(document.getElementById(id)); // clear DOM ready for next test
        localStorage.removeItem('todos-elmish_' + id);
    }
    t.end();
});
test('3. Mark all as completed ("TOGGLE_ALL")', function (t) {
    elmish.empty(document.getElementById(id));
    localStorage.removeItem('todos-elmish_' + id);
    const model = {
        todos: [
            { id: 0, title: "Learn Elm Architecture", done: true },
            { id: 1, title: "Build Todo List App", done: false },
            { id: 2, title: "Win the Internet!", done: false }
        ],
        hash: '#/' // the "route" to display
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, app.update, app.view, id);
    // confirm that the ONLY the first todo item is done=true:
    const items = document.querySelectorAll('.view');
    document.querySelectorAll('.toggle').forEach(function (item, index) {
        t.equal(item.checked, model.todos[index].done, "Todo #" + index + " is done=" + item.checked
            + " text: " + items[index].textContent);
    });
    // click the toggle-all checkbox to trigger TOGGLE_ALL: >> true
    const toggleAll = document.getElementById('toggle-all');
    if (toggleAll) {
        toggleAll.click(); // click toggle-all checkbox
        document.querySelectorAll('.toggle').forEach(function (item, index) {
            t.equal(item.checked, true, "TOGGLE each Todo #" + index + " is done=" + item.checked
                + " text: " + items[index].textContent);
        });
        t.equal(toggleAll.checked, true, "should allow me to mark all items as completed");
        // click the toggle-all checkbox to TOGGLE_ALL (again!) true >> false
        toggleAll.click(); // click toggle-all checkbox
        document.querySelectorAll('.toggle').forEach(function (item, index) {
            t.equal(item.checked, false, "TOGGLE_ALL Todo #" + index + " is done=" + item.checked
                + " text: " + items[index].textContent);
        });
        t.equal(toggleAll.checked, false, "should allow me to clear the completion state of all items");
        // *manually* "click" each todo item:
        document.querySelectorAll('.toggle').forEach(function (item, index) {
            item.click(); // this should "toggle" the todo checkbox to done=true
            t.equal(item.checked, true, ".toggle.click() (each) Todo #" + index + " which is done=" + item.checked
                + " text: " + items[index].textContent);
        });
        // the toggle-all checkbox should be "checked" as all todos are done=true!
        t.equal(toggleAll.checked, true, "complete all checkbox should update state when items are completed");
    }
    elmish.empty(document.getElementById(id)); // clear DOM ready for next test
    localStorage.removeItem('todos-elmish_store');
    t.end();
});
test('4. Item: should allow me to mark items as complete', function (t) {
    elmish.empty(document.getElementById(id));
    localStorage.removeItem('todos-elmish_' + id);
    const model = {
        todos: [
            { id: 0, title: "Make something people want.", done: false }
        ],
        hash: '#/' // the "route" to display
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, app.update, app.view, id);
    const item = document.getElementById('0');
    t.equal(item === null || item === void 0 ? void 0 : item.textContent, model.todos[0].title, 'Item contained in model.');
    // confirm that the todo item is NOT done (done=false):
    t.equal(document.querySelectorAll('.toggle')[0].checked, false, 'Item starts out "active" (done=false)');
    // click the checkbox to toggle it to done=true
    const toggleElement = document.querySelectorAll('.toggle')[0];
    if (toggleElement) {
        toggleElement.click();
        t.equal(toggleElement.checked, true, 'Item should allow me to mark items as complete');
        // click the checkbox to toggle it to done=false "undo"
        toggleElement.click();
        t.equal(toggleElement.checked, false, 'Item should allow me to un-mark items as complete');
    }
    t.end();
});
test('4.1 DELETE item by clicking <button class="destroy">', function (t) {
    elmish.empty(document.getElementById(id));
    localStorage.removeItem('todos-elmish_' + id);
    const model = {
        todos: [
            { id: 0, title: "Make something people want.", done: false }
        ],
        hash: '#/' // the "route" to display
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, app.update, app.view, id);
    // const todo_count = ;
    t.equal(document.querySelectorAll('.destroy').length, 1, "one destroy button");
    const item = document.getElementById('0');
    if (item) {
        t.equal(item.textContent, model.todos[0].title, 'Item contained in DOM.');
        // DELETE the item by clicking on the <button class="destroy">:
        const button = item.querySelectorAll('button.destroy')[0];
        if (button) {
            button.click();
            // confirm that there is no loger a <button class="destroy">
            t.equal(document.querySelectorAll('button.destroy').length, 0, 'there is no loger a <button class="destroy"> as the only item was DELETEd');
            t.equal(document.getElementById('0'), null, 'todo item successfully DELETEd');
        }
    }
    t.end();
});
test('5.1 Editing: > Render an item in "editing mode"', function (t) {
    elmish.empty(document.getElementById(id));
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
        container.appendChild(app.render_item(model.todos[2], model, mock_signal));
        // test that signal (in case of the test mock_signal) is onclick attribute:
        const label = document.querySelectorAll('.view > label')[0];
        if (label && label.onclick) {
            t.equal(label.onclick.toString(), mock_signal().toString(), "mock_signal is onclick attribute of label");
        }
    }
    // test that the <li class="editing"> and <input class="edit"> was rendered:
    const editingElements = document.querySelectorAll('.editing');
    t.equal(editingElements.length, 1, "<li class='editing'> element is visible");
    const editInputs = document.querySelectorAll('.edit');
    t.equal(editInputs.length, 1, "<input class='edit'> element is visible");
    const editInput = editInputs[0];
    if (editInput) {
        t.equal(editInput.value, model.todos[2].title, "<input class='edit'> has value: " + model.todos[2].title);
    }
    t.end();
});
test('5.2 Double-click an item <label> to edit it', function (t) {
    elmish.empty(document.getElementById(id));
    localStorage.removeItem('todos-elmish_' + id);
    const model = {
        todos: [
            { id: 0, title: "Make something people want.", done: false },
            { id: 1, title: "Let's solve our own problem", done: false }
        ],
        hash: '#/' // the "route" to display
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, app.update, app.view, id);
    const labels = document.querySelectorAll('.view > label');
    if (labels.length > 1) {
        const label = labels[1];
        // "double-click" i.e. click the <label> twice in quick succession:
        if (label) {
            label.click();
            label.click();
            // confirm that we are now in editing mode:
            t.equal(document.querySelectorAll('.editing').length, 1, "<li class='editing'> element is visible");
            const editInput = document.querySelectorAll('.edit')[0];
            if (editInput) {
                t.equal(editInput.value, model.todos[1].title, "<input class='edit'> has value: " + model.todos[1].title);
            }
        }
    }
    t.end();
});
test('5.2.2 Slow clicks do not count as double-click > no edit!', function (t) {
    elmish.empty(document.getElementById(id));
    localStorage.removeItem('todos-elmish_' + id);
    const model = {
        todos: [
            { id: 0, title: "Make something people want.", done: false },
            { id: 1, title: "Let's solve our own problem", done: false }
        ],
        hash: '#/' // the "route" to display
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, app.update, app.view, id);
    const labels = document.querySelectorAll('.view > label');
    if (labels.length > 1) {
        const label = labels[1];
        // "double-click" i.e. click the <label> twice in quick succession:
        if (label) {
            label.click();
            setTimeout(function () {
                label.click();
                // confirm that we are now in editing mode:
                t.equal(document.querySelectorAll('.editing').length, 0, "<li class='editing'> element is NOT visible");
                t.end();
            }, 301);
        }
    }
});
test('5.3 [ENTER] Key in edit mode triggers SAVE action', function (t) {
    elmish.empty(document.getElementById(id));
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
    elmish.mount(model, app.update, app.view, id);
    // change the
    const updated_title = "Do things that don\'t scale!  ";
    // apply the updated_title to the <input class="edit">:
    const editInput = document.querySelectorAll('.edit')[0];
    if (editInput) {
        editInput.value = updated_title;
    }
    // trigger the [Enter] keyboard key to ADD the new todo:
    const appElement = document.getElementById(id);
    if (appElement) {
        appElement.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', bubbles: true }));
    }
    // confirm that the todo item title was updated to the updated_title:
    const label = document.querySelectorAll('.view > label')[1].textContent;
    t.equal(label, updated_title.trim(), "item title updated to:" + updated_title + ' (trimmed)');
    t.end();
});
test('5.4 SAVE should remove the item if an empty text string was entered', function (t) {
    const element = document.getElementById(id);
    if (element) {
        elmish.empty(element);
    }
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
    elmish.mount(model, app.update, app.view, id);
    t.equal(document.querySelectorAll('.view').length, 2, 'todo count: 2');
    // apply empty string to the <input class="edit">:
    const editElement = document.querySelectorAll('.edit')[0];
    editElement.value = '';
    // trigger the [Enter] keyboard key to ADD the new todo:
    document.dispatchEvent(new KeyboardEvent('keyup', { 'keyCode': 13 }));
    // confirm that the todo item was removed!
    t.equal(document.querySelectorAll('.view').length, 1, 'todo count: 1');
    t.end();
});
test('5.5 CANCEL should cancel edits on escape', function (t) {
    const element = document.getElementById(id);
    if (element) {
        elmish.empty(element);
    }
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
    elmish.mount(model, app.update, app.view, id);
    t.equal(document.querySelectorAll('.view > label')[1].textContent, model.todos[1].title, 'todo id 1 has title: ' + model.todos[1].title);
    // apply empty string to the <input class="edit">:
    const editElement = document.querySelectorAll('.edit')[0];
    editElement.value = 'Hello World';
    // trigger the [esc] keyboard key to CANCEL editing
    document.dispatchEvent(new KeyboardEvent('keyup', { 'keyCode': 27 }));
    // confirm the item.title is still the original title:
    t.equal(document.querySelectorAll('.view > label')[1].textContent, model.todos[1].title, 'todo id 1 has title: ' + model.todos[1].title);
    localStorage.removeItem('todos-elmish_' + id);
    t.end();
});
test('6. Counter > should display the current number of todo items', function (t) {
    const element = document.getElementById(id);
    if (element) {
        elmish.empty(element);
    }
    const model = {
        todos: [
            { id: 0, title: "Make something people want.", done: false },
            { id: 1, title: "Bootstrap for as long as you can", done: false },
            { id: 2, title: "Let's solve our own problem", done: false }
        ],
        hash: '#/'
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, app.update, app.view, id);
    // count:
    const countElement = document.getElementById('count');
    const count = countElement ? parseInt(countElement.textContent || '0', 10) : 0;
    t.equal(count, model.todos.length, "displays todo item count: " + count);
    const clearElement = document.getElementById(id);
    if (clearElement) {
        elmish.empty(clearElement);
    }
    localStorage.removeItem('todos-elmish_' + id);
    t.end();
});
test('7. Clear Completed > should display the number of completed items', function (t) {
    const element = document.getElementById(id);
    if (element) {
        elmish.empty(element);
    }
    const model = {
        todos: [
            { id: 0, title: "Make something people want.", done: false },
            { id: 1, title: "Bootstrap for as long as you can", done: true },
            { id: 2, title: "Let's solve our own problem", done: true }
        ],
        hash: '#/'
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, app.update, app.view, id);
    // count todo items in DOM:
    t.equal(document.querySelectorAll('.view').length, 3, "at the start, there are 3 todo items in the DOM.");
    // count completed items
    const completedCountElement = document.getElementById('completed-count');
    const completed_count = completedCountElement
        ? parseInt(completedCountElement.textContent || '0', 10)
        : 0;
    const done_count = model.todos.filter(function (i) { return i.done; }).length;
    t.equal(completed_count, done_count, "displays completed items count: " + completed_count);
    // clear completed items:
    const button = document.querySelectorAll('.clear-completed')[0];
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
test('8. Persistence > should persist its data', function (t) {
    const element = document.getElementById(id);
    if (element) {
        elmish.empty(element);
    }
    const model = {
        todos: [
            { id: 0, title: "Make something people want.", done: false }
        ],
        hash: '#/'
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, app.update, app.view, id);
    // confirm that the model is saved to localStorage
    // console.log('localStorage', localStorage.getItem('todos-elmish_' + id));
    const storedData = localStorage.getItem('todos-elmish_' + id);
    if (storedData) {
        t.equal(storedData, JSON.stringify(model), "data is persisted to localStorage");
    }
    else {
        t.fail("No data found in localStorage");
    }
    const clearElement = document.getElementById(id);
    if (clearElement) {
        elmish.empty(clearElement); // clear DOM ready for next test
    }
    localStorage.removeItem('todos-elmish_' + id);
    t.end();
});
test('9. Routing > should allow me to display active/completed/all items', function (t) {
    localStorage.removeItem('todos-elmish_' + id);
    const element = document.getElementById(id);
    if (element) {
        elmish.empty(element);
    }
    const model = {
        todos: [
            { id: 0, title: "Make something people want.", done: false },
            { id: 1, title: "Bootstrap for as long as you can", done: true },
            { id: 2, title: "Let's solve our own problem", done: true }
        ],
        hash: '#/active' // ONLY ACTIVE items
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, app.update, app.view, id);
    const mod = app.update('ROUTE', model);
    // t.equal(mod.hash, '#/', 'default route is #/');
    t.equal(document.querySelectorAll('.view').length, 1, "one active item");
    let selected = document.querySelectorAll('.selected')[0];
    t.equal(selected.id, 'active', "active footer filter is selected");
    // empty:
    const clearElement = document.getElementById(id);
    if (clearElement) {
        elmish.empty(clearElement);
    }
    localStorage.removeItem('todos-elmish_' + id);
    // show COMPLTED items:
    model.hash = '#/completed';
    elmish.mount(model, app.update, app.view, id);
    t.equal(document.querySelectorAll('.view').length, 2, "two completed items");
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
    elmish.mount(model, app.update, app.view, id);
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
