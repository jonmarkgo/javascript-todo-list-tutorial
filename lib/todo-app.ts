import { TodoItem, Model, Action } from './types';
import { mountElmish as mount } from './elmish';

export function render_item(todo: TodoItem, model: Model, signal: (action: Action) => void): HTMLLIElement {
    const li = document.createElement('li');
    li.id = `todo-${todo.id}`;
    li.className = todo.completed ? 'completed' : '';
    const div = document.createElement('div');
    div.className = 'view';
    const toggle = document.createElement('input');
    toggle.className = 'toggle';
    toggle.type = 'checkbox';
    toggle.checked = todo.completed;
    toggle.onclick = () => signal({ type: 'TOGGLE', id: todo.id });
    const label = document.createElement('label');
    label.appendChild(document.createTextNode(todo.title));
    label.ondblclick = (e) => {
        li.className = 'editing';
        edit.focus();
    };
    const button = document.createElement('button');
    button.className = 'destroy';
    button.onclick = () => signal({ type: 'DELETE', id: todo.id });
    div.appendChild(toggle);
    div.appendChild(label);
    div.appendChild(button);
    const edit = document.createElement('input');
    edit.className = 'edit';
    edit.value = todo.title;
    edit.onkeyup = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && edit.value.trim()) {
            signal({ type: 'UPDATE', id: todo.id, title: edit.value });
            li.className = '';
        }
        if (e.key === 'Escape') {
            li.className = '';
        }
    };
    edit.onblur = () => {
        li.className = '';
    };
    li.appendChild(div);
    li.appendChild(edit);
    return li;
}

export function render_main(model: Model, signal: (action: Action) => void): HTMLElement {
    const main = document.createElement('section');
    main.className = 'main';
    const toggle_all = document.createElement('input');
    toggle_all.id = 'toggle-all';
    toggle_all.className = 'toggle-all';
    toggle_all.type = 'checkbox';
    toggle_all.checked = model.todos.every((todo) => todo.completed);
    toggle_all.onclick = () => signal({ type: 'TOGGLE_ALL' });
    const label = document.createElement('label');
    label.htmlFor = 'toggle-all';
    label.appendChild(document.createTextNode('Mark all as complete'));
    const ul = document.createElement('ul');
    ul.className = 'todo-list';
    model.todos
        .filter((todo) => {
            if (model.visibility === 'active')
                return !todo.completed;
            if (model.visibility === 'completed')
                return todo.completed;
            return true;
        })
        .forEach((todo) => {
            ul.appendChild(render_item(todo, model, signal));
        });
    main.appendChild(toggle_all);
    main.appendChild(label);
    main.appendChild(ul);
    return main;
}

export function render_footer(model: Model): HTMLElement {
    const footer = document.createElement('footer');
    footer.className = 'footer';
    const span = document.createElement('span');
    span.className = 'todo-count';
    const count = model.todos.filter((todo) => !todo.completed).length;
    span.appendChild(document.createTextNode(`${count} item${count !== 1 ? 's' : ''} left`));
    const ul = document.createElement('ul');
    ul.className = 'filters';
    const filters = ['All', 'Active', 'Completed'];
    filters.forEach((filter) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#/';
        a.appendChild(document.createTextNode(filter));
        if (model.visibility === filter.toLowerCase()) {
            a.className = 'selected';
        }
        li.appendChild(a);
        ul.appendChild(li);
    });
    const button = document.createElement('button');
    button.className = 'clear-completed';
    button.appendChild(document.createTextNode('Clear completed'));
    footer.appendChild(span);
    footer.appendChild(ul);
    footer.appendChild(button);
    return footer;
}

export function view(model: Model): HTMLElement {
    const div = document.createElement('div');
    div.appendChild(render_main(model, signal));
    div.appendChild(render_footer(model));
    return div;
}

export let model: Model = {
    todos: [],
    visibility: 'all',
    hash: ''
};

export function update(msg: Action, model: Model): Model {
    switch (msg.type) {
        case 'ADD':
            return {
                ...model,
                todos: [
                    ...model.todos,
                    { id: Date.now(), title: msg.title, completed: false }
                ]
            };
        case 'TOGGLE':
            return {
                ...model,
                todos: model.todos.map((todo) =>
                    todo.id === msg.id ? { ...todo, completed: !todo.completed } : todo
                )
            };
        case 'DELETE':
            return {
                ...model,
                todos: model.todos.filter((todo) => todo.id !== msg.id)
            };
        case 'UPDATE':
            return {
                ...model,
                todos: model.todos.map((todo) =>
                    todo.id === msg.id ? { ...todo, title: msg.title } : todo
                )
            };
        case 'TOGGLE_ALL':
            const allCompleted = model.todos.every((todo) => todo.completed);
            return {
                ...model,
                todos: model.todos.map((todo) => ({ ...todo, completed: !allCompleted }))
            };
        case 'CLEAR_COMPLETED':
            return {
                ...model,
                todos: model.todos.filter((todo) => !todo.completed)
            };
        case 'SET_VISIBILITY':
            return {
                ...model,
                visibility: msg.filter
            };
        default:
            return model;
    }
}

function signal(action: Action): void {
    model = update(action, model);
    render();
}

export function subscriptions(signal: (action: Action) => void): void {
    window.addEventListener('hashchange', () => {
        signal({ type: 'SET_VISIBILITY', filter: window.location.hash.slice(2) || 'all' });
    });
}

function render(): void {
    const root = document.getElementById('app');
    if (root) {
        root.innerHTML = '';
        root.appendChild(view(model));
    }
}
