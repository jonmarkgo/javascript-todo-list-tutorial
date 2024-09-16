// Define the Component's Actions:
export type Action = 'inc' | 'dec' | 'reset';
export type Model = number;

export function update(action: Action, model: Model): Model {
    switch (action) {
        case 'inc': return model + 1; // add 1 to the model
        case 'dec': return model - 1; // subtract 1 from model
        case 'reset': return 0; // reset state to 0 (Zero)
        default: return model; // if no action, return current state.
    }
}

export function view(model: Model, signal: (action: Action) => () => void): HTMLElement {
    return container([
        button('+', signal('inc')),
        div('count', model.toString()),
        button('-', signal('dec')),
        button('Reset', signal('reset'))
    ]);
}

export function mount(model: Model, update: (action: Action, model: Model) => Model, view: (model: Model, signal: (action: Action) => () => void) => HTMLElement, root_element_id: string, doc: Document = document): void {
    const root = doc.getElementById(root_element_id);
    if (!root) throw new Error(`Element with id ${root_element_id} not found`);

    function signal(action: Action) {
        return function callback() {
            model = update(action, model);
            empty(root!);
            root!.appendChild(view(model, signal));
        };
    }
    root.appendChild(view(model, signal));
}

function empty(node: HTMLElement): void {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

function button(text: string, onclick: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = text;
    button.onclick = onclick;
    return button;
}

function div(divid: string, text: string): HTMLDivElement {
    const div = document.createElement('div');
    div.id = divid;
    div.className = divid;
    div.textContent = text;
    return div;
}

function container(elements: HTMLElement[]): HTMLElement {
    const con = document.createElement('section');
    con.className = 'counter';
    elements.forEach((el) => con.appendChild(el));
    return con;
}
