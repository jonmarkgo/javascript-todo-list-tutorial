import tape from 'tape'; // https://github.com/dwyl/learn-tape
import fs from 'fs'; // to read html files (see below)
import path from 'path'; // so we can open files cross-platform
import * as app from '../lib/todo-app'; // functions to test
import * as elmish from '../lib/elmish'; // import "elmish" core functions
var html = fs.readFileSync(path.resolve(__dirname, '../index.html'));
require('jsdom-global')(html); // https://github.com/rstacruz/jsdom-global
var id = 'test-app'; // all tests use 'test-app' as root element
tape('`model` (Object) has desired keys', function (t) {
    var keys = Object.keys(app.initial_model);
    t.deepEqual(keys, ['todos', 'hash', 'all_done'], "`todos`, `hash`, and `all_done` keys are present.");
    t.true(Array.isArray(app.initial_model.todos), "model.todos is an Array");
    t.end();
});
tape('`update` default case should return model unmodified', function (t) {
    var model = JSON.parse(JSON.stringify(app.initial_model));
    var unmodified_model = app.update('UNKNOWN_ACTION', model);
    t.deepEqual(model, unmodified_model, "model returned unmodified");
    t.end();
});
tape('update `ADD` a new todo item to model.todos Array', function (t) {
    var model = JSON.parse(JSON.stringify(app.initial_model)); // initial state
    t.equal(model.todos.length, 0, "initial model.todos.length is 0");
    var updated_model = app.update('ADD', model, "Add Todo List Item");
    var expected = { id: 1, title: "Add Todo List Item", done: false };
    t.equal(updated_model.todos.length, 1, "updated_model.todos.length is 1");
    t.deepEqual(updated_model.todos[0], expected, "Todo list item added.");
    t.end();
});
tape('update `TOGGLE` a todo item from done=false to done=true', function (t) {
    var model = JSON.parse(JSON.stringify(app.initial_model)); // initial state
    var model_with_todo = app.update('ADD', model, "Toggle a todo list item");
    var item = model_with_todo.todos[0];
    var model_todo_done = app.update('TOGGLE', model_with_todo, item.id);
    var expected = { id: 1, title: "Toggle a todo list item", done: true };
    t.deepEqual(model_todo_done.todos[0], expected, "Todo list item Toggled.");
    t.end();
});
tape('`TOGGLE` (undo) a todo item from done=true to done=false', function (t) {
    var model = JSON.parse(JSON.stringify(app.initial_model)); // initial state
    var model_with_todo = app.update('ADD', model, "Toggle a todo list item");
    var item = model_with_todo.todos[0];
    var model_todo_done = app.update('TOGGLE', model_with_todo, item.id);
    var expected = { id: 1, title: "Toggle a todo list item", done: true };
    t.deepEqual(model_todo_done.todos[0], expected, "Toggled done=false >> true");
    // add another item before "undoing" the original one:
    var model_second_item = app.update('ADD', model_todo_done, "Another todo");
    t.equal(model_second_item.todos.length, 2, "there are TWO todo items");
    // Toggle the original item such that: done=true >> done=false
    var model_todo_undone = app.update('TOGGLE', model_second_item, item.id);
    var undone = { id: 1, title: "Toggle a todo list item", done: false };
    t.deepEqual(model_todo_undone.todos[0], undone, "Todo item Toggled > undone!");
    t.end();
});
// this is used for testing view functions which require a signal function
function mock_signal() {
    return function inner_function() {
        console.log('done');
    };
}
tape('render_item HTML for a single Todo Item', function (t) {
    var model = {
        todos: [
            { id: 1, title: "Learn Elm Architecture", done: true },
        ],
        hash: '#/', // the "route" to display
        all_done: false
    };
    // render the ONE todo list item:
    var rootElement = document.getElementById(id);
    if (rootElement) {
        rootElement.appendChild(app.render_item(model.todos[0], model, mock_signal));
        var doneElement = document.querySelector('.completed');
        if (doneElement) {
            var done = doneElement.textContent;
            t.equal(done, 'Learn Elm Architecture', 'Done: Learn "TEA"');
        }
        var inputElement = document.querySelector('input');
        if (inputElement) {
            var checked = inputElement.checked;
            t.equal(checked, true, 'Done: ' + model.todos[0].title + " is done=true");
        }
        elmish.emptyNode(rootElement); // clear DOM ready for next test
    }
    t.end();
});
tape('render_item HTML without a valid signal function', function (t) {
    var model = {
        todos: [
            { id: 1, title: "Learn Elm Architecture", done: true },
        ],
        hash: '#/', // the "route" to display
        all_done: false
    };
    // render the ONE todo list item:
    var rootElement = document.getElementById(id);
    if (rootElement) {
        rootElement.appendChild(app.render_item(model.todos[0], model, function () { }));
        var doneElement = document.querySelector('.completed');
        if (doneElement) {
            var done = doneElement.textContent;
            t.equal(done, 'Learn Elm Architecture', 'Done: Learn "TEA"');
        }
        var inputElement = document.querySelector('input');
        if (inputElement) {
            var checked = inputElement.checked;
            t.equal(checked, true, 'Done: ' + model.todos[0].title + " is done=true");
        }
        elmish.emptyNode(rootElement); // clear DOM ready for next test
    }
    t.end();
});
tape('render_main "main" view using (elmish) HTML DOM functions', function (t) {
    var model = {
        todos: [
            { id: 1, title: "Learn Elm Architecture", done: true },
            { id: 2, title: "Build Todo List App", done: false },
            { id: 3, title: "Win the Internet!", done: false }
        ],
        hash: '#/', // the "route" to display
        all_done: false
    };
    // render the "main" view and append it to the DOM inside the `test-app` node:
    var rootElement = document.getElementById(id);
    if (rootElement) {
        rootElement.appendChild(app.render_main(model, mock_signal));
        // test that the title text in the model.todos was rendered to <label> nodes:
        document.querySelectorAll('.view').forEach(function (item, index) {
            t.equal(item.textContent, model.todos[index].title, "index #" + index + " <label> text: " + item.textContent);
        });
        var inputs = document.querySelectorAll('input'); // todo items are 1,2,3
        [true, false, false].forEach(function (state, index) {
            t.equal(inputs[index + 1].checked, state, "Todo #" + index + " is done=" + state);
        });
        elmish.emptyNode(rootElement); // clear DOM ready for next test
    }
    t.end();
});
tape('render_footer view using (elmish) HTML DOM functions', function (t) {
    var model = {
        todos: [
            { id: 1, title: "Learn Elm Architecture", done: true },
            { id: 2, title: "Build Todo List App", done: false },
            { id: 3, title: "Win the Internet!", done: false }
        ],
        hash: '#/', // the "route" to display
        all_done: false
    };
    // render_footer view and append it to the DOM inside the `test-app` node:
    var rootElement = document.getElementById(id);
    if (rootElement) {
        rootElement.appendChild(app.render_footer(model, function () { }));
        // todo-count should display 2 items left (still to be done):
        var countElement = document.getElementById('count');
        if (countElement) {
            var left = countElement.innerHTML;
            t.equal(left, "<strong>2</strong> items left", "Todos remaining: " + left);
        }
        // count number of footer <li> items:
        t.equal(document.querySelectorAll('li').length, 3, "3 <li> in <footer>");
        // check footer link text and href:
        var link_text = ['All', 'Active', 'Completed'];
        var hrefs = ['#/', '#/active', '#/completed'];
        document.querySelectorAll('a').forEach(function (a, index) {
            // check link text:
            t.equal(a.textContent, link_text[index], "<footer> link #" + index
                + " is: " + a.textContent + " === " + link_text[index]);
            // check hrefs:
            t.equal(a.href.replace('about:blank', ''), hrefs[index], "<footer> link #" + index + " href is: " + hrefs[index]);
        });
        // check for "Clear completed" button in footer:
        var clearCompletedElement = document.querySelector('.clear-completed');
        if (clearCompletedElement) {
            var clear = clearCompletedElement.textContent;
            t.equal(clear, 'Clear completed [1]', '<button> in <footer> "Clear completed [1]"');
        }
        elmish.emptyNode(rootElement); // clear DOM ready for next test
    }
    t.end();
});
tape('render_footer 1 item left (pluarisation test)', function (t) {
    var model = {
        todos: [
            { id: 1, title: "Be excellent to each other!", done: false }
        ],
        hash: '#/', // the "route" to display
        all_done: false
    };
    // render_footer view and append it to the DOM inside the `test-app` node:
    var rootElement = document.getElementById(id);
    if (rootElement) {
        rootElement.appendChild(app.render_footer(model, function () { }));
        // todo-count should display "1 item left" (still to be done):
        var countElement = document.getElementById('count');
        if (countElement) {
            var left = countElement.innerHTML;
            t.equal(left, "<strong>1</strong> item left", "Todos remaining: " + left);
        }
        elmish.empty(rootElement); // clear DOM ready for next test
    }
    t.end();
});
tape('view renders the whole todo app using "partials"', function (t) {
    // render the view and append it to the DOM inside the `test-app` node:
    var model = {
        todos: [],
        hash: '#/',
        all_done: false
    };
    var rootElement = document.getElementById(id);
    if (rootElement) {
        var view = app.view(model, mock_signal);
        rootElement.appendChild(view);
    }
    var h1Element = document.querySelectorAll('h1')[0];
    if (h1Element) {
        t.equal(h1Element.textContent, "todos", "<h1>todos");
    }
    // placeholder:
    var newTodoElement = document.getElementById('new-todo');
    if (newTodoElement) {
        var placeholder = newTodoElement.getAttribute("placeholder");
        t.equal(placeholder, "What needs to be done?", "paceholder set on <input>");
    }
    // todo-count should display 0 items left (based on initial_model):
    var countElement = document.getElementById('count');
    if (countElement) {
        var left = countElement.innerHTML;
        t.equal(left, "<strong>0</strong> items left", "Todos remaining: " + left);
    }
    elmish.empty(document.getElementById(id)); // clear DOM ready for next test
    t.end();
});
tape('1. No Todos, should hide #footer and #main', function (t) {
    // render the view and append it to the DOM inside the `test-app` node:
    var rootElement = document.getElementById(id);
    if (rootElement) {
        var model = { todos: [], hash: '#/', all_done: false };
        rootElement.appendChild(app.view(model, function () { })); // No Todos
        var mainElement = document.getElementById('main');
        if (mainElement) {
            var main_display = window.getComputedStyle(mainElement);
            t.equal(main_display.display, 'none', "No Todos, hide #main");
        }
        var footerElement = document.getElementById('footer');
        if (footerElement) {
            var main_footer = window.getComputedStyle(footerElement);
            t.equal(main_footer.display, 'none', "No Todos, hide #footer");
        }
        elmish.empty(rootElement); // clear DOM ready for next test
    }
    t.end();
});
// Testing localStorage requires "polyfil" because:a
// https://github.com/jsdom/jsdom/issues/1137 ¯\_(ツ)_/¯
// globals are usually bad! but a "necessary evil" here.
global.localStorage = global.localStorage ? global.localStorage : {
    getItem: function (key) {
        var value = this[key];
        return typeof value === 'undefined' ? null : String(value);
    },
    setItem: function (key, value) {
        this[key] = value;
    },
    removeItem: function (key) {
        delete this[key];
    },
    clear: function () {
        var _this = this;
        Object.keys(this).forEach(function (key) { return delete _this[key]; });
    },
    key: function (index) {
        return Object.keys(this)[index] || null;
    },
    length: 0
};
localStorage.removeItem('todos-elmish_store');
tape('2. New Todo, should allow me to add todo items', function (t) {
    var rootElement = document.getElementById(id);
    if (rootElement)
        elmish.empty(rootElement);
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount({ todos: [], hash: '#/', all_done: false }, app.update, app.view, id, app.subscriptions);
    var new_todo = document.getElementById('new-todo');
    // "type" content in the <input id="new-todo">:
    var todo_text = 'Make Everything Awesome!     '; // deliberate whitespace!
    if (new_todo) {
        new_todo.value = todo_text;
    }
    // trigger the [Enter] keyboard key to ADD the new todo:
    document.dispatchEvent(new KeyboardEvent('keyup', { 'keyCode': 13 }));
    var items = document.querySelectorAll('.view');
    t.equal(items.length, 1, "should allow me to add todo items");
    // check if the new todo was added to the DOM:
    var element = document.getElementById('1');
    var actual = element ? element.textContent : null;
    t.equal(todo_text.trim(), actual, "should trim text input");
    // subscription keyCode trigger "branch" test (should NOT fire the signal):
    var cloneElement = document.getElementById(id);
    var clone = cloneElement ? cloneElement.cloneNode(true) : null;
    document.dispatchEvent(new KeyboardEvent('keyup', { 'keyCode': 42 }));
    t.deepEqual(document.getElementById(id), clone, "#" + id + " no change");
    // check that the <input id="new-todo"> was reset after the new item was added
    if (new_todo) {
        t.equal(new_todo.value, '', "should clear text input field when an item is added");
    }
    var mainElement = document.getElementById('main');
    var main_display = mainElement ? window.getComputedStyle(mainElement) : null;
    t.equal('block', main_display === null || main_display === void 0 ? void 0 : main_display.display, "should show #main and #footer when items added");
    var footerElement = document.getElementById('footer');
    var main_footer = footerElement ? window.getComputedStyle(footerElement) : null;
    t.equal('block', main_footer === null || main_footer === void 0 ? void 0 : main_footer.display, "item added, show #footer");
    if (rootElement)
        elmish.empty(rootElement); // clear DOM ready for next test
    localStorage.removeItem('todos-elmish_' + id);
    t.end();
});
tape('3. Mark all as completed ("TOGGLE_ALL")', function (t) {
    var rootElement = document.getElementById(id);
    if (rootElement)
        elmish.empty(rootElement);
    localStorage.removeItem('todos-elmish_' + id);
    var model = {
        todos: [
            { id: 0, title: "Learn Elm Architecture", done: true },
            { id: 1, title: "Build Todo List App", done: false },
            { id: 2, title: "Win the Internet!", done: false }
        ],
        hash: '#/', // the "route" to display
        all_done: false
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, app.update, app.view, id, app.subscriptions);
    // confirm that the ONLY the first todo item is done=true:
    var items = document.querySelectorAll('.view');
    document.querySelectorAll('.toggle').forEach(function (item, index) {
        var checkbox = item;
        t.equal(checkbox.checked, model.todos[index].done, "Todo #" + index + " is done=" + checkbox.checked
            + " text: " + items[index].textContent);
    });
    // click the toggle-all checkbox to trigger TOGGLE_ALL: >> true
    var toggleAll = document.getElementById('toggle-all');
    if (toggleAll)
        toggleAll.click(); // click toggle-all checkbox
    document.querySelectorAll('.toggle').forEach(function (item, index) {
        var checkbox = item;
        t.equal(checkbox.checked, true, "TOGGLE each Todo #" + index + " is done=" + checkbox.checked
            + " text: " + items[index].textContent);
    });
    t.equal(toggleAll === null || toggleAll === void 0 ? void 0 : toggleAll.checked, true, "should allow me to mark all items as completed");
    // click the toggle-all checkbox to TOGGLE_ALL (again!) true >> false
    if (toggleAll)
        toggleAll.click(); // click toggle-all checkbox
    document.querySelectorAll('.toggle').forEach(function (item, index) {
        var checkbox = item;
        t.equal(checkbox.checked, false, "TOGGLE_ALL Todo #" + index + " is done=" + checkbox.checked
            + " text: " + items[index].textContent);
    });
    t.equal(toggleAll === null || toggleAll === void 0 ? void 0 : toggleAll.checked, false, "should allow me to clear the completion state of all items");
    // *manually* "click" each todo item:
    document.querySelectorAll('.toggle').forEach(function (item, index) {
        var checkbox = item;
        checkbox.click(); // this should "toggle" the todo checkbox to done=true
        t.equal(checkbox.checked, true, ".toggle.click() (each) Todo #" + index + " which is done=" + checkbox.checked
            + " text: " + items[index].textContent);
    });
    // the toggle-all checkbox should be "checked" as all todos are done=true!
    t.equal(toggleAll === null || toggleAll === void 0 ? void 0 : toggleAll.checked, true, "complete all checkbox should update state when items are completed");
    if (rootElement)
        elmish.empty(rootElement); // clear DOM ready for next test
    localStorage.removeItem('todos-elmish_store');
    t.end();
});
tape('4. Item: should allow me to mark items as complete', function (t) {
    var rootElement = document.getElementById(id);
    if (rootElement)
        elmish.empty(rootElement);
    localStorage.removeItem('todos-elmish_' + id);
    var model = {
        todos: [
            { id: 0, title: "Make something people want.", done: false }
        ],
        hash: '#/', // the "route" to display
        all_done: false
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, app.update, app.view, id, app.subscriptions);
    var item = document.getElementById('0');
    t.equal(item === null || item === void 0 ? void 0 : item.textContent, model.todos[0].title, 'Item contained in model.');
    // confirm that the todo item is NOT done (done=false):
    var checkbox = document.querySelectorAll('.toggle')[0];
    t.equal(checkbox.checked, false, 'Item starts out "active" (done=false)');
    // click the checkbox to toggle it to done=true
    var toggleElement = document.querySelectorAll('.toggle')[0];
    toggleElement.click();
    t.equal(document.querySelectorAll('.toggle')[0].checked, true, 'Item should allow me to mark items as complete');
    // click the checkbox to toggle it to done=false "undo"
    toggleElement.click();
    t.equal(document.querySelectorAll('.toggle')[0].checked, false, 'Item should allow me to un-mark items as complete');
    t.end();
});
tape('4.1 DELETE item by clicking <button class="destroy">', function (t) {
    var rootElement = document.getElementById(id);
    if (rootElement)
        elmish.empty(rootElement);
    localStorage.removeItem('todos-elmish_' + id);
    var model = {
        todos: [
            { id: 0, title: "Make something people want.", done: false }
        ],
        hash: '#/', // the "route" to display
        all_done: false
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, app.update, app.view, id, app.subscriptions);
    // const todo_count = ;
    t.equal(document.querySelectorAll('.destroy').length, 1, "one destroy button");
    var item = document.getElementById('0');
    if (item) {
        t.equal(item.textContent, model.todos[0].title, 'Item contained in DOM.');
        // DELETE the item by clicking on the <button class="destroy">:
        var button = item.querySelectorAll('button.destroy')[0];
        button.click();
    }
    // confirm that there is no loger a <button class="destroy">
    t.equal(document.querySelectorAll('button.destroy').length, 0, 'there is no loger a <button class="destroy"> as the only item was DELETEd');
    t.equal(document.getElementById('0'), null, 'todo item successfully DELETEd');
    t.end();
});
tape('5.1 Editing: > Render an item in "editing mode"', function (t) {
    var _a;
    var rootElement = document.getElementById(id);
    if (rootElement)
        elmish.empty(rootElement);
    localStorage.removeItem('todos-elmish_' + id);
    var model = {
        todos: [
            { id: 0, title: "Make something people want.", done: false },
            { id: 1, title: "Bootstrap for as long as you can", done: false },
            { id: 2, title: "Let's solve our own problem", done: false }
        ],
        hash: '#/', // the "route" to display
        editing: 2, // edit the 3rd todo list item (which has id == 2)
        all_done: false
    };
    // render the ONE todo list item in "editing mode" based on model.editing:
    var container = document.getElementById(id);
    if (container) {
        container.appendChild(app.render_item(model.todos[2], model, mock_signal));
    }
    // test that signal (in case of the test mock_signal) is onclick attribute:
    var label = document.querySelectorAll('.view > label')[0];
    t.equal((_a = label.onclick) === null || _a === void 0 ? void 0 : _a.toString(), mock_signal().toString(), "mock_signal is onclick attribute of label");
    // test that the <li class="editing"> and <input class="edit"> was rendered:
    t.equal(document.querySelectorAll('.editing').length, 1, "<li class='editing'> element is visible");
    t.equal(document.querySelectorAll('.edit').length, 1, "<input class='edit'> element is visible");
    var editInput = document.querySelectorAll('.edit')[0];
    t.equal(editInput.value, model.todos[2].title, "<input class='edit'> has value: " + model.todos[2].title);
    t.end();
});
tape('5.2 Double-click an item <label> to edit it', function (t) {
    var rootElement = document.getElementById(id);
    if (rootElement)
        elmish.empty(rootElement);
    localStorage.removeItem('todos-elmish_' + id);
    var model = {
        todos: [
            { id: 0, title: "Make something people want.", done: false },
            { id: 1, title: "Let's solve our own problem", done: false }
        ],
        hash: '#/', // the "route" to display
        all_done: false
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, app.update, app.view, id, app.subscriptions);
    var label = document.querySelectorAll('.view > label')[1];
    // "double-click" i.e. click the <label> twice in quick succession:
    label.click();
    label.click();
    // confirm that we are now in editing mode:
    t.equal(document.querySelectorAll('.editing').length, 1, "<li class='editing'> element is visible");
    var editInput = document.querySelectorAll('.edit')[0];
    if (editInput) {
        t.equal(editInput.value, model.todos[1].title, "<input class='edit'> has value: " + model.todos[1].title);
    }
    t.end();
});
tape('5.2.2 Slow clicks do not count as double-click > no edit!', function (t) {
    var rootElement = document.getElementById(id);
    if (rootElement)
        elmish.empty(rootElement);
    localStorage.removeItem('todos-elmish_' + id);
    var model = {
        todos: [
            { id: 0, title: "Make something people want.", done: false },
            { id: 1, title: "Let's solve our own problem", done: false }
        ],
        hash: '#/', // the "route" to display
        all_done: false
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, app.update, app.view, id, app.subscriptions);
    var label = document.querySelectorAll('.view > label')[1];
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
});
tape('5.3 [ENTER] Key in edit mode triggers SAVE action', function (t) {
    var rootElement = document.getElementById(id);
    if (rootElement)
        elmish.empty(rootElement);
    localStorage.removeItem('todos-elmish_' + id);
    var model = {
        todos: [
            { id: 0, title: "Make something people want.", done: false },
            { id: 1, title: "Let's solve our own problem", done: false }
        ],
        hash: '#/', // the "route" to display
        editing: 1, // edit the 3rd todo list item (which has id == 2)
        all_done: false
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, app.update, app.view, id, app.subscriptions);
    // change the
    var updated_title = "Do things that don\'t scale!  ";
    // apply the updated_title to the <input class="edit">:
    var editInput = document.querySelectorAll('.edit')[0];
    if (editInput)
        editInput.value = updated_title;
    // trigger the [Enter] keyboard key to ADD the new todo:
    document.dispatchEvent(new KeyboardEvent('keyup', { 'keyCode': 13 }));
    // confirm that the todo item title was updated to the updated_title:
    var label = document.querySelectorAll('.view > label')[1].textContent;
    t.equal(label, updated_title.trim(), "item title updated to:" + updated_title + ' (trimmed)');
    t.end();
});
tape('5.4 SAVE should remove the item if an empty text string was entered', function (t) {
    var rootElement = document.getElementById(id);
    if (rootElement)
        elmish.empty(rootElement);
    localStorage.removeItem('todos-elmish_' + id);
    var model = {
        todos: [
            { id: 0, title: "Make something people want.", done: false },
            { id: 1, title: "Let's solve our own problem", done: false }
        ],
        hash: '#/', // the "route" to display
        editing: 1, // edit the 3rd todo list item (which has id == 2)
        all_done: false
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, app.update, app.view, id, app.subscriptions);
    t.equal(document.querySelectorAll('.view').length, 2, 'todo count: 2');
    // apply empty string to the <input class="edit">:
    var editInput = document.querySelectorAll('.edit')[0];
    if (editInput) {
        editInput.value = '';
        // trigger the [Enter] keyboard key to ADD the new todo:
        document.dispatchEvent(new KeyboardEvent('keyup', { 'keyCode': 13 }));
        // confirm that the todo item was removed!
        t.equal(document.querySelectorAll('.view').length, 1, 'todo count: 1');
    }
    t.end();
});
tape('5.5 CANCEL should cancel edits on escape', function (t) {
    var rootElement = document.getElementById(id);
    if (rootElement)
        elmish.empty(rootElement);
    localStorage.removeItem('todos-elmish_' + id);
    var model = {
        todos: [
            { id: 0, title: "Make something people want.", done: false },
            { id: 1, title: "Let's solve our own problem", done: false }
        ],
        hash: '#/', // the "route" to display
        editing: 1, // edit the 3rd todo list item (which has id == 2)
        all_done: false
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, app.update, app.view, id, app.subscriptions);
    var label = document.querySelectorAll('.view > label')[1];
    if (label) {
        t.equal(label.textContent, model.todos[1].title, 'todo id 1 has title: ' + model.todos[1].title);
    }
    // apply empty string to the <input class="edit">:
    var editInput = document.querySelectorAll('.edit')[0];
    if (editInput) {
        editInput.value = 'Hello World';
        // trigger the [esc] keyboard key to CANCEL editing
        document.dispatchEvent(new KeyboardEvent('keyup', { 'keyCode': 27 }));
    }
    // confirm the item.title is still the original title:
    t.equal(document.querySelectorAll('.view > label')[1].textContent, model.todos[1].title, 'todo id 1 has title: ' + model.todos[1].title);
    localStorage.removeItem('todos-elmish_' + id);
    t.end();
});
tape('6. Counter > should display the current number of todo items', function (t) {
    var rootElement = document.getElementById(id);
    if (rootElement)
        elmish.empty(rootElement);
    var model = {
        todos: [
            { id: 0, title: "Make something people want.", done: false },
            { id: 1, title: "Bootstrap for as long as you can", done: false },
            { id: 2, title: "Let's solve our own problem", done: false }
        ],
        hash: '#/',
        all_done: false
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, app.update, app.view, id, app.subscriptions);
    // count:
    var countElement = document.getElementById('count');
    var count = countElement ? parseInt(countElement.textContent || '0', 10) : 0;
    t.equal(count, model.todos.length, "displays todo item count: " + count);
    var clearElement = document.getElementById(id);
    if (clearElement)
        elmish.empty(clearElement); // clear DOM ready for next test
    localStorage.removeItem('todos-elmish_' + id);
    t.end();
});
tape('7. Clear Completed > should display the number of completed items', function (t) {
    var rootElement = document.getElementById(id);
    if (rootElement)
        elmish.empty(rootElement);
    var model = {
        todos: [
            { id: 0, title: "Make something people want.", done: false },
            { id: 1, title: "Bootstrap for as long as you can", done: false },
            { id: 2, title: "Let's solve our own problem", done: false }
        ],
        hash: '#/',
        all_done: false
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, app.update, app.view, id, app.subscriptions);
    t.equal(document.querySelectorAll('.view').length, 3, "displays todo item count: " + model.todos.length);
    // click the checkbox to toggle it to done=true
    var toggleElement = document.querySelectorAll('.toggle')[0];
    toggleElement.click();
    // click the checkbox to toggle it to done=true
    var toggleElement2 = document.querySelectorAll('.toggle')[1];
    toggleElement2.click();
    // confirm that there are now 2 completed items:
    t.equal(document.querySelectorAll('.completed').length, 2, "displays completed todo count: 2");
    // click the "Clear completed" button:
    var button = document.querySelectorAll('.clear-completed')[0];
    if (button) {
        button.click();
    }
    // confirm that there is now only ONE todo list item in the DOM:
    t.equal(document.querySelectorAll('.view').length, 1, "after clearing completed items, there is only 1 todo item in the DOM.");
    // no clear completed button in the DOM when there are no "done" todo items:
    t.equal(document.querySelectorAll('clear-completed').length, 0, 'no clear-completed button when there are no done items.');
    var clearElement = document.getElementById(id);
    if (clearElement)
        elmish.empty(clearElement); // clear DOM ready for next test
    localStorage.removeItem('todos-elmish_' + id);
    t.end();
});
tape('8. Persistence > should persist its data', function (t) {
    var rootElement = document.getElementById(id);
    if (rootElement)
        elmish.empty(rootElement);
    var model = {
        todos: [
            { id: 0, title: "Make something people want.", done: false }
        ],
        hash: '#/',
        all_done: false
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, app.update, app.view, id, app.subscriptions);
    // confirm that the model is saved to localStorage
    // console.log('localStorage', localStorage.getItem('todos-elmish_' + id));
    t.equal(localStorage.getItem('todos-elmish_' + id), JSON.stringify(model), "data is persisted to localStorage");
    var clearElement = document.getElementById(id);
    if (clearElement)
        elmish.empty(clearElement); // clear DOM ready for next test
    localStorage.removeItem('todos-elmish_' + id);
    t.end();
});
tape('9. Routing > should allow me to display active/completed/all items', function (t) {
    localStorage.removeItem('todos-elmish_' + id);
    var rootElement = document.getElementById(id);
    if (rootElement)
        elmish.empty(rootElement);
    var model = {
        todos: [
            { id: 0, title: "Make something people want.", done: false },
            { id: 1, title: "Bootstrap for as long as you can", done: true },
            { id: 2, title: "Let's solve our own problem", done: true }
        ],
        hash: '#/active', // ONLY ACTIVE items
        all_done: false
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, app.update, app.view, id, app.subscriptions);
    var mod = app.update('ROUTE', model);
    // t.equal(mod.hash, '#/', 'default route is #/');
    t.equal(document.querySelectorAll('.view').length, 1, "one active item");
    var selected = document.querySelectorAll('.selected')[0];
    t.equal(selected.id, 'active', "active footer filter is selected");
    // empty:
    var clearElement1 = document.getElementById(id);
    if (clearElement1)
        elmish.empty(clearElement1);
    localStorage.removeItem('todos-elmish_' + id);
    // show COMPLTED items:
    model.hash = '#/completed';
    model.all_done = false;
    elmish.mount(model, app.update, app.view, id, app.subscriptions);
    t.equal(document.querySelectorAll('.view').length, 2, "two completed items");
    selected = document.querySelectorAll('.selected')[0];
    t.equal(selected.id, 'completed', "completed footer filter is selected");
    // empty:
    var clearElement2 = document.getElementById(id);
    if (clearElement2)
        elmish.empty(clearElement2);
    localStorage.removeItem('todos-elmish_' + id);
    // show ALL items:
    model.hash = '#/';
    model.all_done = false;
    elmish.mount(model, app.update, app.view, id, app.subscriptions);
    t.equal(document.querySelectorAll('.view').length, 3, "three items total");
    selected = document.querySelectorAll('.selected')[0];
    t.equal(selected.id, 'all', "all footer filter is selected");
    var clearElement3 = document.getElementById(id);
    if (clearElement3)
        elmish.empty(clearElement3); // clear DOM ready for next test
    localStorage.removeItem('todos-elmish_' + id);
    t.end();
});
