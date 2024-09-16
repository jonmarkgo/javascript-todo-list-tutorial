import { expect } from 'chai';
import * as app from '../todo-app';
import * as elmish from '../elmish';
// JSDOM setup is now handled by the test script
const id = 'test-app'; // all tests use 'test-app' as root element
// Mock localStorage
class MockLocalStorage {
    constructor() {
        this.store = {};
    }
    getItem(key) {
        return this.store[key] || null;
    }
    setItem(key, value) {
        this.store[key] = value;
    }
    removeItem(key) {
        delete this.store[key];
    }
    clear() {
        this.store = {};
    }
    key(index) {
        return Object.keys(this.store)[index] || null;
    }
    get length() {
        return Object.keys(this.store).length;
    }
}
Object.defineProperty(window, 'localStorage', { value: new MockLocalStorage() });
describe('model', () => {
    it('has desired keys', () => {
        const keys = Object.keys(app.model);
        expect(keys).to.deep.equal(['todos', 'hash']);
        expect(Array.isArray(app.model.todos)).to.be.true;
    });
});
describe('update function', () => {
    it('should return model unmodified for unknown action', () => {
        const model = JSON.parse(JSON.stringify(app.model));
        const unmodified_model = app.update('UNKNOWN_ACTION', model, '');
        expect(model).to.deep.equal(unmodified_model);
    });
    it('should add a new todo item to model.todos Array', () => {
        const model = JSON.parse(JSON.stringify(app.model)); // initial state
        expect(model.todos.length).to.equal(0);
        const updated_model = app.update('ADD', model, "Add Todo List Item");
        const expected = { id: 1, title: "Add Todo List Item", done: false };
        expect(updated_model.todos.length).to.equal(1);
        expect(updated_model.todos[0]).to.deep.equal(expected);
    });
});
describe('update TOGGLE', () => {
    it('should toggle a todo item from done=false to done=true', () => {
        const model = JSON.parse(JSON.stringify(app.model)); // initial state
        const model_with_todo = app.update('ADD', model, "Toggle a todo list item");
        const item = model_with_todo.todos[0];
        const model_todo_done = app.update('TOGGLE', model_with_todo, item.id);
        const expected = { id: 1, title: "Toggle a todo list item", done: true };
        expect(model_todo_done.todos[0]).to.deep.equal(expected);
    });
    it('should toggle (undo) a todo item from done=true to done=false', () => {
        const model = JSON.parse(JSON.stringify(app.model)); // initial state
        const model_with_todo = app.update('ADD', model, "Toggle a todo list item");
        const item = model_with_todo.todos[0];
        const model_todo_done = app.update('TOGGLE', model_with_todo, item.id);
        const expected = { id: 1, title: "Toggle a todo list item", done: true };
        expect(model_todo_done.todos[0]).to.deep.equal(expected);
        // add another item before "undoing" the original one:
        const model_second_item = app.update('ADD', model_todo_done, "Another todo");
        expect(model_second_item.todos.length).to.equal(2);
        // Toggle the original item such that: done=true >> done=false
        const model_todo_undone = app.update('TOGGLE', model_second_item, item.id);
        const undone = { id: 1, title: "Toggle a todo list item", done: false };
        expect(model_todo_undone.todos[0]).to.deep.equal(undone);
    });
});
// this is used for testing view functions which require a signal function
function mock_signal() {
    return function (action, data) {
        return function inner_function() {
            console.log('Action:', action, 'Data:', data);
        };
    };
}
describe('render_item', () => {
    it('should render HTML for a single Todo Item', () => {
        const model = {
            todos: [
                { id: 1, title: "Learn Elm Architecture", done: true },
            ],
            hash: '#/' // the "route" to display
        };
        const container = document.getElementById(id);
        expect(container).to.exist;
        if (container) {
            container.appendChild(app.render_item(model.todos[0], model, mock_signal()));
            const doneElement = document.querySelector('.completed');
            expect(doneElement).to.exist;
            expect(doneElement === null || doneElement === void 0 ? void 0 : doneElement.textContent).to.equal('Learn Elm Architecture');
            const checkedElement = document.querySelector('input');
            expect(checkedElement).to.exist;
            if (checkedElement) {
                expect(checkedElement.checked).to.be.true;
            }
            elmish.empty(container);
        }
    });
});
describe('render_item', () => {
    it('should render HTML without a valid signal function', () => {
        const model = {
            todos: [
                { id: 1, title: "Learn Elm Architecture", done: true },
            ],
            hash: '#/' // the "route" to display
        };
        const element = document.getElementById(id);
        expect(element).to.exist;
        if (element) {
            element.appendChild(app.render_item(model.todos[0], model, () => () => { }));
            const doneElement = document.querySelector('.completed');
            expect(doneElement).to.exist;
            expect(doneElement === null || doneElement === void 0 ? void 0 : doneElement.textContent).to.equal('Learn Elm Architecture');
            const checkedElement = document.querySelector('input');
            expect(checkedElement).to.exist;
            if (checkedElement) {
                expect(checkedElement.checked).to.be.true;
            }
            elmish.empty(element);
        }
    });
});
describe('render_main', () => {
    it('should render "main" view using (elmish) HTML DOM functions', () => {
        const model = {
            todos: [
                { id: 1, title: "Learn Elm Architecture", done: true },
                { id: 2, title: "Build Todo List App", done: false },
                { id: 3, title: "Win the Internet!", done: false }
            ],
            hash: '#/' // the "route" to display
        };
        // render the "main" view and append it to the DOM inside the `test-app` node:
        const container = document.getElementById(id);
        expect(container).to.exist;
        if (container) {
            container.appendChild(app.render_main(model, mock_signal()));
            // test that the title text in the model.todos was rendered to <label> nodes:
            const viewElements = document.querySelectorAll('.view');
            viewElements.forEach((item, index) => {
                expect(item.textContent).to.equal(model.todos[index].title, `index #${index} <label> text: ${item.textContent}`);
            });
            const inputs = document.querySelectorAll('input'); // todo items are 1,2,3
            [true, false, false].forEach((state, index) => {
                const input = inputs[index + 1];
                expect(input.checked).to.equal(state, `Todo #${index} is done=${state}`);
            });
            elmish.empty(container);
        }
    });
});
describe('render_footer', () => {
    it('should render footer view using (elmish) HTML DOM functions', () => {
        const model = {
            todos: [
                { id: 1, title: "Learn Elm Architecture", done: true },
                { id: 2, title: "Build Todo List App", done: false },
                { id: 3, title: "Win the Internet!", done: false }
            ],
            hash: '#/' // the "route" to display
        };
        const container = document.getElementById(id);
        expect(container).to.exist;
        if (container) {
            container.appendChild(app.render_footer(model, mock_signal()));
            // todo-count should display 2 items left (still to be done):
            const countElement = document.getElementById('count');
            expect(countElement).to.exist;
            if (countElement) {
                expect(countElement.innerHTML).to.equal("<strong>2</strong> items left");
            }
            // count number of footer <li> items:
            expect(document.querySelectorAll('li').length).to.equal(3);
            // check footer link text and href:
            const link_text = ['All', 'Active', 'Completed'];
            const hrefs = ['#/', '#/active', '#/completed'];
            const anchorElements = document.querySelectorAll('a');
            anchorElements.forEach((a, index) => {
                expect(a.textContent).to.equal(link_text[index]);
                expect(a.getAttribute('href')).to.equal(hrefs[index]);
            });
            // check for "Clear completed" button in footer:
            const clearElement = document.querySelector('.clear-completed');
            expect(clearElement).to.exist;
            if (clearElement) {
                expect(clearElement.textContent).to.equal('Clear completed [1]');
            }
            elmish.empty(container);
        }
    });
});
describe('render_footer', () => {
    it('should display "1 item left" for pluralization', () => {
        const model = {
            todos: [
                { id: 1, title: "Be excellent to each other!", done: false }
            ],
            hash: '#/' // the "route" to display
        };
        // render_footer view and append it to the DOM inside the `test-app` node:
        const container = document.getElementById(id);
        expect(container).to.exist;
        if (container) {
            container.appendChild(app.render_footer(model, mock_signal()));
            // todo-count should display "1 item left" (still to be done):
            const countElement = document.getElementById('count');
            expect(countElement).to.exist;
            if (countElement) {
                expect(countElement.innerHTML).to.equal("<strong>1</strong> item left");
            }
        }
        elmish.empty(container);
    });
});
describe('view', () => {
    it('renders the whole todo app using "partials"', () => {
        // render the view and append it to the DOM inside the `test-app` node:
        const container = document.getElementById(id);
        expect(container).to.exist;
        if (container) {
            container.appendChild(app.view(app.model, mock_signal())); // initial_model
            const h1Element = document.querySelector('h1');
            expect(h1Element).to.exist;
            expect(h1Element === null || h1Element === void 0 ? void 0 : h1Element.textContent).to.equal("todos");
            // placeholder:
            const newTodoElement = document.getElementById('new-todo');
            expect(newTodoElement).to.exist;
            expect(newTodoElement.getAttribute("placeholder")).to.equal("What needs to be done?");
            // todo-count should display 0 items left (based on initial_model):
            const countElement = document.getElementById('count');
            expect(countElement).to.exist;
            expect(countElement === null || countElement === void 0 ? void 0 : countElement.innerHTML).to.equal("<strong>0</strong> items left");
        }
        elmish.empty(container);
    });
});
describe('1. No Todos', () => {
    it('should hide #footer and #main', () => {
        // render the view and append it to the DOM inside the `test-app` node:
        const container = document.getElementById(id);
        expect(container).to.exist;
        if (container) {
            container.appendChild(app.view({ todos: [], hash: '#/' }, mock_signal())); // No Todos
            const mainElement = document.getElementById('main');
            expect(mainElement).to.exist;
            if (mainElement) {
                const main_display = window.getComputedStyle(mainElement);
                expect(main_display.display).to.equal('none', "No Todos, hide #main");
            }
            const footerElement = document.getElementById('footer');
            expect(footerElement).to.exist;
            if (footerElement) {
                const main_footer = window.getComputedStyle(footerElement);
                expect(main_footer.display).to.equal('none', "No Todos, hide #footer");
            }
        }
        elmish.empty(container);
    });
});
// Testing localStorage requires "polyfill" because:
// https://github.com/jsdom/jsdom/issues/1137 ¯\_(ツ)_/¯
// globals are usually bad! but a "necessary evil" here.
if (!global.localStorage) {
    global.localStorage = new class {
        constructor() {
            this.store = {};
        }
        getItem(key) {
            return this.store[key] || null;
        }
        setItem(key, value) {
            this.store[key] = value;
        }
        removeItem(key) {
            delete this.store[key];
        }
        clear() {
            this.store = {};
        }
        key(index) {
            return Object.keys(this.store)[index] || null;
        }
        get length() {
            return Object.keys(this.store).length;
        }
    };
}
localStorage.removeItem('todos-elmish_store');
describe('2. New Todo', () => {
    it('should allow me to add todo items', () => {
        var _a;
        const container = document.getElementById(id);
        expect(container).to.exist;
        if (container) {
            elmish.empty(container);
            // render the view and append it to the DOM inside the `test-app` node:
            elmish.mount({ todos: [], hash: '#/' }, app.update, app.view, id, app.subscriptions);
            const new_todo = document.getElementById('new-todo');
            expect(new_todo).to.exist;
            if (new_todo) {
                // "type" content in the <input id="new-todo">:
                const todo_text = 'Make Everything Awesome!     '; // deliberate whitespace!
                new_todo.value = todo_text;
                // trigger the [Enter] key
                document.dispatchEvent(new KeyboardEvent('keyup', { 'key': 'Enter' }));
                // Check if the todo was added
                const items = document.querySelectorAll('.view');
                expect(items.length).to.equal(1, "should allow me to add todo items");
                // check if the new todo was added to the DOM:
                const actual = (_a = document.getElementById('1')) === null || _a === void 0 ? void 0 : _a.textContent;
                expect(todo_text.trim()).to.equal(actual, "should trim text input");
                // check that the <input id="new-todo"> was reset after the new item was added
                expect(new_todo.value).to.equal('', "should clear text input field when an item is added");
                const mainElement = document.getElementById('main');
                const footerElement = document.getElementById('footer');
                expect(mainElement).to.exist;
                expect(footerElement).to.exist;
                if (mainElement && footerElement) {
                    const main_display = window.getComputedStyle(mainElement);
                    const footer_display = window.getComputedStyle(footerElement);
                    expect(main_display.display).to.equal('block', "should show #main when items added");
                    expect(footer_display.display).to.equal('block', "should show #footer when items added");
                }
            }
        }
        elmish.empty(container);
        localStorage.removeItem('todos-elmish_store');
    });
});
describe('4. Item', () => {
    it('should allow me to mark items as complete', () => {
        const container = document.getElementById(id);
        expect(container).to.exist;
        if (container) {
            elmish.empty(container);
            localStorage.removeItem('todos-elmish_' + id);
            const model = {
                todos: [
                    { id: 0, title: "Make something people want.", done: false }
                ],
                hash: '#/' // the "route" to display
            };
            // render the view and append it to the DOM inside the `test-app` node:
            elmish.mount(model, app.update, app.view, id, app.subscriptions);
            const item = document.getElementById('0');
            expect(item).to.exist;
            expect(item === null || item === void 0 ? void 0 : item.textContent).to.equal(model.todos[0].title, 'Item contained in model.');
            // confirm that the todo item is NOT done (done=false):
            const toggle = document.querySelector('.toggle');
            expect(toggle).to.exist;
            expect(toggle.checked).to.be.false;
            // click the checkbox to toggle it to done=true
            toggle.click();
            expect(toggle.checked).to.be.true;
            // click the checkbox to toggle it to done=false "undo"
            toggle.click();
            expect(toggle.checked).to.be.false;
        }
    });
});
describe('4.1 DELETE item', () => {
    it('should delete an item by clicking <button class="destroy">', () => {
        const container = document.getElementById(id);
        expect(container).to.exist;
        if (container) {
            elmish.empty(container);
            localStorage.removeItem('todos-elmish_' + id);
            const model = {
                todos: [
                    { id: 0, title: "Make something people want.", done: false }
                ],
                hash: '#/' // the "route" to display
            };
            // render the view and append it to the DOM inside the `test-app` node:
            elmish.mount(model, app.update, app.view, id, app.subscriptions);
            expect(document.querySelectorAll('.destroy').length).to.equal(1, "one destroy button");
            const item = document.getElementById('0');
            expect(item).to.exist;
            expect(item === null || item === void 0 ? void 0 : item.textContent).to.equal(model.todos[0].title, 'Item contained in DOM.');
            // DELETE the item by clicking on the <button class="destroy">:
            const button = item === null || item === void 0 ? void 0 : item.querySelector('button.destroy');
            expect(button).to.exist;
            button === null || button === void 0 ? void 0 : button.click();
            // confirm that there is no longer a <button class="destroy">
            expect(document.querySelectorAll('button.destroy').length).to.equal(0, 'there is no longer a <button class="destroy"> as the only item was DELETEd');
            expect(document.getElementById('0')).to.be.null;
        }
    });
});
describe('5.1 Editing', () => {
    it('should render an item in "editing mode"', () => {
        const container = document.getElementById(id);
        expect(container).to.exist;
        if (container) {
            elmish.empty(container);
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
            container.appendChild(app.render_item(model.todos[2], model, mock_signal()));
            // test that the <li class="editing"> and <input class="edit"> was rendered:
            expect(document.querySelectorAll('.editing').length).to.equal(1, "<li class='editing'> element is visible");
            expect(document.querySelectorAll('.edit').length).to.equal(1, "<input class='edit'> element is visible");
            const editInput = document.querySelector('.edit');
            expect(editInput).to.exist;
            expect(editInput.value).to.equal(model.todos[2].title, "<input class='edit'> has correct value");
        }
    });
});
describe('5.2 Double-click an item <label> to edit it', () => {
    it('should enter editing mode on double-click', () => {
        const container = document.getElementById(id);
        expect(container).to.exist;
        if (container) {
            elmish.empty(container);
        }
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
        const label = document.querySelectorAll('.view > label')[1];
        // "double-click" i.e. click the <label> twice in quick succession:
        label.click();
        label.click();
        // confirm that we are now in editing mode:
        expect(document.querySelectorAll('.editing').length).to.equal(1, "<li class='editing'> element is visible");
        const editInput = document.querySelector('.edit');
        expect(editInput).to.exist;
        expect(editInput.value).to.equal(model.todos[1].title, "<input class='edit'> has correct value");
    });
});
describe('5.2.2 Slow clicks do not count as double-click', () => {
    it('should not enter editing mode on slow clicks', (done) => {
        const container = document.getElementById(id);
        expect(container).to.exist;
        if (container) {
            elmish.empty(container);
        }
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
        const label = document.querySelectorAll('.view > label')[1];
        // "double-click" i.e. click the <label> twice in quick succession:
        label.click();
        setTimeout(() => {
            label.click();
            // confirm that we are not in editing mode:
            expect(document.querySelectorAll('.editing').length).to.equal(0, "<li class='editing'> element is NOT visible");
            done();
        }, 301);
    });
});
describe('5.3 [ENTER] Key in edit mode triggers SAVE action', () => {
    it('should save the edited todo item on ENTER key', () => {
        const container = document.getElementById(id);
        expect(container).to.exist;
        if (container) {
            elmish.empty(container);
        }
        localStorage.removeItem('todos-elmish_' + id);
        const model = {
            todos: [
                { id: 0, title: "Make something people want.", done: false },
                { id: 1, title: "Let's solve our own problem", done: false }
            ],
            hash: '#/', // the "route" to display
            editing: 1 // edit the 2nd todo list item (which has id == 1)
        };
        // render the view and append it to the DOM inside the `test-app` node:
        elmish.mount(model, app.update, app.view, id, app.subscriptions);
        const updated_title = "Do things that don't scale!  ";
        // apply the updated_title to the <input class="edit">:
        const editInput = document.querySelector('.edit');
        expect(editInput).to.exist;
        editInput.value = updated_title;
        // trigger the [Enter] keyboard key to SAVE the edited todo:
        document.dispatchEvent(new KeyboardEvent('keyup', { 'key': 'Enter' }));
        // confirm that the todo item title was updated to the updated_title:
        const label = document.querySelectorAll('.view > label')[1];
        expect(label).to.exist;
        expect(label.textContent).to.equal(updated_title.trim(), `item title updated to: ${updated_title.trim()}`);
    });
});
describe('5.4 SAVE should remove the item if an empty text string was entered', () => {
    it('should remove the todo item if saved with empty text', () => {
        const container = document.getElementById(id);
        expect(container).to.exist;
        if (container) {
            elmish.empty(container);
        }
        localStorage.removeItem('todos-elmish_' + id);
        const model = {
            todos: [
                { id: 0, title: "Make something people want.", done: false },
                { id: 1, title: "Let's solve our own problem", done: false }
            ],
            hash: '#/', // the "route" to display
            editing: 1 // edit the 2nd todo list item (which has id == 1)
        };
        // render the view and append it to the DOM inside the `test-app` node:
        elmish.mount(model, app.update, app.view, id, app.subscriptions);
        expect(document.querySelectorAll('.view').length).to.equal(2, 'todo count: 2');
        // apply empty string to the <input class="edit">:
        const editInput = document.querySelector('.edit');
        expect(editInput).to.exist;
        editInput.value = '';
        // trigger the [Enter] keyboard key to SAVE the edited todo:
        document.dispatchEvent(new KeyboardEvent('keyup', { 'key': 'Enter' }));
        // confirm that the todo item was removed!
        expect(document.querySelectorAll('.view').length).to.equal(1, 'todo count: 1');
    });
});
describe('5.5 CANCEL should cancel edits on escape', () => {
    it('should cancel edits when ESC key is pressed', () => {
        const container = document.getElementById(id);
        expect(container).to.exist;
        if (container) {
            elmish.empty(container);
        }
        localStorage.removeItem('todos-elmish_' + id);
        const model = {
            todos: [
                { id: 0, title: "Make something people want.", done: false },
                { id: 1, title: "Let's solve our own problem", done: false }
            ],
            hash: '#/', // the "route" to display
            editing: 1 // edit the 2nd todo list item (which has id == 1)
        };
        // render the view and append it to the DOM inside the `test-app` node:
        elmish.mount(model, app.update, app.view, id, app.subscriptions);
        const originalLabel = document.querySelectorAll('.view > label')[1];
        expect(originalLabel).to.exist;
        expect(originalLabel.textContent).to.equal(model.todos[1].title, `todo id 1 has title: ${model.todos[1].title}`);
        // apply new text to the <input class="edit">:
        const editInput = document.querySelector('.edit');
        expect(editInput).to.exist;
        editInput.value = 'Hello World';
        // trigger the [esc] keyboard key to CANCEL editing
        document.dispatchEvent(new KeyboardEvent('keyup', { 'key': 'Escape' }));
        // confirm the item.title is still the original title:
        const newLabel = document.querySelectorAll('.view > label')[1];
        expect(newLabel).to.exist;
        expect(newLabel.textContent).to.equal(model.todos[1].title, `todo id 1 has title: ${model.todos[1].title}`);
        localStorage.removeItem('todos-elmish_' + id);
    });
});
describe('6. Counter', () => {
    it('should display the current number of todo items', () => {
        const container = document.getElementById(id);
        expect(container).to.exist;
        if (container) {
            elmish.empty(container);
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
        elmish.mount(model, app.update, app.view, id, app.subscriptions);
        // count:
        const countElement = document.getElementById('count');
        expect(countElement).to.exist;
        const count = parseInt(countElement.textContent || '0', 10);
        expect(count).to.equal(model.todos.length, `displays todo item count: ${count}`);
        if (container) {
            elmish.empty(container); // clear DOM ready for next test
        }
        localStorage.removeItem('todos-elmish_' + id);
    });
});
describe('7. Clear Completed', () => {
    it('should display the number of completed items', () => {
        const container = document.getElementById(id);
        expect(container).to.exist;
        if (container) {
            elmish.empty(container);
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
        elmish.mount(model, app.update, app.view, id, app.subscriptions);
        // count todo items in DOM:
        expect(document.querySelectorAll('.view').length).to.equal(3, "at the start, there are 3 todo items in the DOM.");
        // count completed items
        const completedCountElement = document.getElementById('completed-count');
        expect(completedCountElement).to.exist;
        const completed_count = parseInt(completedCountElement.textContent || '0', 10);
        const done_count = model.todos.filter(i => i.done).length;
        expect(completed_count).to.equal(done_count, `displays completed items count: ${completed_count}`);
        // clear completed items:
        const button = document.querySelector('.clear-completed');
        expect(button).to.exist;
        button.click();
        // confirm that there is now only ONE todo list item in the DOM:
        expect(document.querySelectorAll('.view').length).to.equal(1, "after clearing completed items, there is only 1 todo item in the DOM.");
        // no clear completed button in the DOM when there are no "done" todo items:
        expect(document.querySelectorAll('.clear-completed').length).to.equal(0, 'no clear-completed button when there are no done items.');
        if (container) {
            elmish.empty(container); // clear DOM ready for next test
        }
        localStorage.removeItem('todos-elmish_' + id);
    });
});
describe('8. Persistence', () => {
    it('should persist its data', () => {
        const container = document.getElementById(id);
        expect(container).to.exist;
        if (container) {
            elmish.empty(container);
        }
        const model = {
            todos: [
                { id: 0, title: "Make something people want.", done: false }
            ],
            hash: '#/'
        };
        // render the view and append it to the DOM inside the `test-app` node:
        elmish.mount(model, app.update, app.view, id, app.subscriptions);
        // confirm that the model is saved to localStorage
        expect(localStorage.getItem('todos-elmish_' + id)).to.equal(JSON.stringify(model), "data is persisted to localStorage");
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
        expect(container).to.exist;
        if (container) {
            elmish.empty(container);
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
        elmish.mount(model, app.update, app.view, id, app.subscriptions);
        const mod = app.update('ROUTE', model);
        expect(document.querySelectorAll('.view').length).to.equal(1, "one active item");
        let selected = document.querySelector('.selected');
        expect(selected).to.exist;
        expect(selected.id).to.equal('active', "active footer filter is selected");
        // empty:
        if (container) {
            elmish.empty(container);
        }
        localStorage.removeItem('todos-elmish_' + id);
        // show COMPLETED items:
        model.hash = '#/completed';
        elmish.mount(model, app.update, app.view, id, app.subscriptions);
        expect(document.querySelectorAll('.view').length).to.equal(2, "two completed items");
        selected = document.querySelector('.selected');
        expect(selected).to.exist;
        expect(selected.id).to.equal('completed', "completed footer filter is selected");
        // empty:
        if (container) {
            elmish.empty(container);
        }
        localStorage.removeItem('todos-elmish_' + id);
        // show ALL items:
        model.hash = '#/';
        elmish.mount(model, app.update, app.view, id, app.subscriptions);
        expect(document.querySelectorAll('.view').length).to.equal(3, "three items total");
        selected = document.querySelector('.selected');
        expect(selected).to.exist;
        expect(selected.id).to.equal('all', "all footer filter is selected");
        if (container) {
            elmish.empty(container); // clear DOM ready for next test
        }
        localStorage.removeItem('todos-elmish_' + id);
    });
});
