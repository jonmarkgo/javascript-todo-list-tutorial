/**
 * `empty` the contents of a given DOM element "node" (before re-rendering).
 * This is the *fastest* way according to: stackoverflow.com/a/3955238/1148249
 * @param  {HTMLElement} node the exact DOM node you want to empty the contents of.
 * @example
 * // returns void (once the 'app' node is emptied)
 * const node = document.getElementById('app');
 * if (node) empty(node);
 */
export function empty(node: HTMLElement): void {
    while (node.lastChild) {
        node.removeChild(node.lastChild);
    }
}

/**
 * `mount` mounts the app in the "root" DOM Element.
 * @param {any} model store of the application's state.
 * @param {Function} update how the application state is updated ("controller")
 * @param {Function} view function that renders HTML/DOM elements with model.
 * @param {string} root_element_id root DOM element in which the app is mounted
 * @param {Function} subscriptions any event listeners the application needs
 */
export function mount(model: any, update: Function, view: Function, root_element_id: string, subscriptions?: Function): void {
    const ROOT = document.getElementById(root_element_id);
    if (!ROOT) {
        throw new Error(`Root element with id ${root_element_id} not found`);
    }
    const store_name = 'todos-elmish_' + root_element_id;

    function render(mod: any, sig: Function, root: HTMLElement): void {
        localStorage.setItem(store_name, JSON.stringify(mod));
        empty(root);
        root.appendChild(view(mod, sig));
    }

    function signal(action: string, data: any): () => void {
        return function callback(): void {
            const storedModel = localStorage.getItem(store_name);
            model = storedModel ? JSON.parse(storedModel) : model;
            const updatedModel = update(action, model, data);
            render(updatedModel, signal, ROOT);
        };
    }

    const storedModel = localStorage.getItem(store_name);
    model = storedModel ? JSON.parse(storedModel) : model;
    render(model, signal, ROOT);

    if (subscriptions && typeof subscriptions === 'function') {
        subscriptions(signal);
    }
}

/**
 * `add_attributes` applies the desired attribute(s) to the specified DOM node.
 * @param {Array<string | Function>} attrlist list of attributes to be applied
 * @param {HTMLElement} node DOM node upon which attribute(s) should be applied
 * @return {HTMLElement} returns the node with attributes applied
 */
export function add_attributes(attrlist: Array<string | Function>, node: HTMLElement): HTMLElement {
    if (attrlist && Array.isArray(attrlist) && attrlist.length > 0) {
        attrlist.forEach((attr) => {
            if (typeof attr === 'function') {
                node.onclick = attr;
                return;
            }
            const [key, value] = (attr as string).split('=');
            switch (key) {
                case 'autofocus':
                    node.setAttribute('autofocus', 'autofocus');
                    node.focus();
                    setTimeout(() => {
                        node.focus();
                    }, 200);
                    break;
                case 'checked':
                    node.setAttribute('checked', 'true');
                    break;
                case 'class':
                    node.className = value;
                    break;
                case 'data-id':
                    node.setAttribute('data-id', value);
                    break;
                case 'for':
                    node.setAttribute('for', value);
                    break;
                case 'href':
                    (node as HTMLAnchorElement).href = value;
                    break;
                case 'id':
                    node.id = value;
                    break;
                case 'placeholder':
                    (node as HTMLInputElement).placeholder = value;
                    break;
                case 'style':
                    node.setAttribute('style', value);
                    break;
                case 'type':
                    node.setAttribute('type', value);
                    break;
                case 'value':
                    console.log('value:', value);
                    (node as HTMLInputElement).value = value;
                    break;
            }
        });
    }
    return node;
}

/**
 * `append_childnodes` appends an array of HTML elements to a parent DOM node.
 * @param  {Array<HTMLElement>} childnodes array of child DOM nodes.
 * @param  {HTMLElement} parent the "parent" DOM node where children will be added.
 * @return {HTMLElement} returns parent DOM node with appended children
 */
export function append_childnodes(childnodes: Array<HTMLElement>, parent: HTMLElement): HTMLElement {
    if (childnodes && Array.isArray(childnodes) && childnodes.length > 0) {
        childnodes.forEach((el) => { parent.appendChild(el); });
    }
    return parent;
}

/**
 * create_element is a "helper" function to "DRY" HTML element creation code
 * @param {string} type of element to be created e.g: 'div', 'section'
 * @param {Array<string | Function>} attrlist list of attributes to be applied to the node
 * @param {Array<HTMLElement>} childnodes array of child DOM nodes.
 * @return {HTMLElement} returns the DOM node with appended children
 */
function create_element(type: string, attrlist: Array<string | Function>, childnodes: Array<HTMLElement>): HTMLElement {
    return append_childnodes(childnodes, add_attributes(attrlist, document.createElement(type)));
}

export function section(attrlist: Array<string | Function>, childnodes: Array<HTMLElement>): HTMLElement {
    return create_element('section', attrlist, childnodes);
}

export function a(attrlist: Array<string | Function>, childnodes: Array<HTMLElement>): HTMLElement {
    return create_element('a', attrlist, childnodes);
}

export function button(attrlist: Array<string | Function>, childnodes: Array<HTMLElement>): HTMLElement {
    return create_element('button', attrlist, childnodes);
}

export function div(attrlist: Array<string | Function>, childnodes: Array<HTMLElement>): HTMLElement {
    return create_element('div', attrlist, childnodes);
}

export function footer(attrlist: Array<string | Function>, childnodes: Array<HTMLElement>): HTMLElement {
    return create_element('footer', attrlist, childnodes);
}

export function header(attrlist: Array<string | Function>, childnodes: Array<HTMLElement>): HTMLElement {
    return create_element('header', attrlist, childnodes);
}

export function h1(attrlist: Array<string | Function>, childnodes: Array<HTMLElement>): HTMLElement {
    return create_element('h1', attrlist, childnodes);
}

export function input(attrlist: Array<string | Function>, childnodes: Array<HTMLElement>): HTMLElement {
    return create_element('input', attrlist, childnodes);
}

export function label(attrlist: Array<string | Function>, childnodes: Array<HTMLElement>): HTMLElement {
    return create_element('label', attrlist, childnodes);
}

export function li(attrlist: Array<string | Function>, childnodes: Array<HTMLElement>): HTMLElement {
    return create_element('li', attrlist, childnodes);
}

export function span(attrlist: Array<string | Function>, childnodes: Array<HTMLElement>): HTMLElement {
    return create_element('span', attrlist, childnodes);
}

export function strong(text_str: string): HTMLElement {
    const el = document.createElement("strong");
    el.innerHTML = text_str;
    return el;
}

export function text(text: string): Text {
    return document.createTextNode(text);
}

export function ul(attrlist: Array<string | Function>, childnodes: Array<HTMLElement>): HTMLElement {
    return create_element('ul', attrlist, childnodes);
}

/**
 * route sets the hash portion of the URL in a web browser.
 * @param {T} model - the current state of the application.
 * @param {string} title - the title of the "page" being navigated to
 * @param {string} hash - the hash (URL) to be navigated to.
 * @return {T} new_state - state with hash updated to the *new* hash.
 */
export function route<T extends { hash: string }>(model: T, title: string, hash: string): T {
    window.location.hash = hash;
    const new_state = JSON.parse(JSON.stringify(model)) as T;
    new_state.hash = hash;
    return new_state;
}
