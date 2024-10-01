/**
 * `empty` the contents of a given DOM element "node" (before re-rendering).
 * This is the *fastest* way according to: stackoverflow.com/a/3955238/1148249
 * @param  {Object} node the exact DOM node you want to empty the contents of.
 * @example
 * // returns true (once the 'app' node is emptied)
 * const node = document.getElementById('app');
 * empty(node);
 */
export function empty(node) {
    while (node.lastChild) {
        node.removeChild(node.lastChild);
    }
} // this function produces a (DOM) "mutation" but has no other "side effects".
/**
 * `mount` mounts the app in the "root" DOM Element.
 * @param {Object} model store of the application's state.
 * @param {Function} update how the application state is updated ("controller")
 * @param {Function} view function that renders HTML/DOM elements with model.
 * @param {String} root_element_id root DOM element in which the app is mounted
 * @param {Function} subscriptions any event listeners the application needs
 */
export function mount(model, update, view, root_element_id, subscriptions) {
    const ROOT = document.getElementById(root_element_id); // root DOM element
    if (!ROOT)
        throw new Error(`Element with id ${root_element_id} not found`);
    const store_name = 'todos-elmish_' + root_element_id; // test-app !== app
    function render(mod, sig, root) {
        localStorage.setItem(store_name, JSON.stringify(mod)); // save the model!
        empty(root); // clear root element (container) before (re)rendering
        root.appendChild(view(mod, sig)); // render view based on model & signal
    }
    function signal(action, data, model) {
        return function callback() {
            model = JSON.parse(localStorage.getItem(store_name) || '{}');
            const updatedModel = update(action, model, data); // update model for action
            if (ROOT) {
                render(updatedModel, signal, ROOT);
            }
        };
    }
    model = JSON.parse(localStorage.getItem(store_name) || '{}') || model;
    if (ROOT) {
        render(model, signal, ROOT);
    }
    if (subscriptions && typeof subscriptions === 'function') {
        subscriptions(signal);
    }
}
/**
* `add_attributes` applies the desired attribute(s) to the specified DOM node.
* Note: this function is "impure" because it "mutates" the node.
* however it is idempotent; the "side effect" is only applied once.
* @param {Array.<String>/<Function>} attrlist list of attributes to be applied
* to the node accepts both String and Function (for onclick handlers).
* @param {Object} node DOM node upon which attribute(s) should be applied
* @example
* // returns node with attributes applied
* input = add_attributes(["type=checkbox", "id=todo1", "checked=true"], input);
*/
export function add_attributes(attrlist, node) {
    // console.log(attrlist, node);
    if (attrlist && Array.isArray(attrlist) && attrlist.length > 0) {
        attrlist.forEach(function (attr) {
            // do not attempt to "split" an onclick function as it's not a string!
            if (typeof attr === 'function') {
                node.onclick = attr;
                return node;
            }
            // apply any attributes that are *not* functions (i.e. Strings):
            const a = attr.split('=');
            switch (a[0]) {
                case 'autofocus':
                    node.setAttribute('autofocus', 'autofocus');
                    node.focus();
                    setTimeout(function () {
                        node.focus();
                    }, 200);
                    break;
                case 'checked':
                    node.setAttribute('checked', 'true');
                    break;
                case 'class':
                    node.className = a[1]; // apply one or more CSS classes
                    break;
                case 'data-id':
                    node.setAttribute('data-id', a[1]); // add data-id e.g: to <li>
                    break;
                case 'for':
                    node.setAttribute('for', a[1]); // e.g: <label for="toggle-all">
                    break;
                case 'href':
                    node.href = a[1]; // e.g: <a href="#/active">Active</a>
                    break;
                case 'id':
                    node.id = a[1]; // apply element id e.g: <input id="toggle-all">
                    break;
                case 'placeholder':
                    node.placeholder = a[1]; // add placeholder to <input> element
                    break;
                case 'style':
                    node.setAttribute("style", a[1]); // <div style="display: block;">
                    break;
                case 'type':
                    node.setAttribute('type', a[1]); // <input id="go" type="checkbox">
                    break;
                case 'value':
                    console.log('value:', a[1]);
                    node.value = a[1];
                    break;
                default:
                    break;
            } // end switch
        });
    }
    return node;
}
/**
 * `append_childnodes` appends an array of HTML elements to a parent DOM node.
 * @param  {Array.<Object>} childnodes array of child DOM nodes.
 * @param  {Object} parent the "parent" DOM node where children will be added.
 * @return {Object} returns parent DOM node with appended children
 * @example
 * // returns the parent node with the "children" appended
 * var parent = elmish.append_childnodes([div, p, section], parent);
 */
export function append_childnodes(childnodes, parent) {
    if (childnodes && Array.isArray(childnodes) && childnodes.length > 0) {
        childnodes.forEach(function (el) { parent.appendChild(el); });
    }
    return parent;
}
/**
 * create_element is a "helper" function to "DRY" HTML element creation code
 * creat *any* element with attributes and childnodes.
 * @param {String} type of element to be created e.g: 'div', 'section'
 * @param {Array.<String>} attrlist list of attributes to be applied to the node
 * @param {Array.<Object>} childnodes array of child DOM nodes.
 * @return {Object} returns the <section> DOM node with appended children
 * @example
 * // returns the parent node with the "children" appended
 * var div = elmish.create_element('div', ["class=todoapp"], [h1, input]);
 */
function create_element(type, attrlist, childnodes) {
    return append_childnodes(childnodes, add_attributes(attrlist, document.createElement(type)));
}
/**
 * section creates a <section> HTML element with attributes and childnodes
 * @param {Array.<String>} attrlist list of attributes to be applied to the node
 * @param {Array.<Object>} childnodes array of child DOM nodes.
 * @return {Object} returns the <section> DOM node with appended children
 * @example
 * // returns <section> DOM element with attributes applied & children appended
 * var section = elmish.section(["class=todoapp"], [h1, input]);
 */
export function section(attrlist, childnodes) {
    return create_element('section', attrlist, childnodes);
}
// these are a *bit* repetitive, if you know a better way, please open an issue!
export function a(attrlist, childnodes) {
    return create_element('a', attrlist, childnodes);
}
export function button(attrlist, childnodes) {
    return create_element('button', attrlist, childnodes);
}
export function div(attrlist, childnodes) {
    return create_element('div', attrlist, childnodes);
}
export function footer(attrlist, childnodes) {
    return create_element('footer', attrlist, childnodes);
}
export function header(attrlist, childnodes) {
    return create_element('header', attrlist, childnodes);
}
export function h1(attrlist, childnodes) {
    return create_element('h1', attrlist, childnodes);
}
export function input(attrlist, childnodes) {
    return create_element('input', attrlist, childnodes);
}
export function label(attrlist, childnodes) {
    return create_element('label', attrlist, childnodes);
}
export function li(attrlist, childnodes) {
    return create_element('li', attrlist, childnodes);
}
export function span(attrlist, childnodes) {
    return create_element('span', attrlist, childnodes);
}
export function strong(text_str) {
    const el = document.createElement("strong");
    el.innerHTML = text_str;
    return el;
}
export function text(text) {
    return document.createTextNode(text);
}
export function ul(attrlist, childnodes) {
    return create_element('ul', attrlist, childnodes);
}
/**
 * route sets the hash portion of the URL in a web browser.
 * @param {Object} model - the current state of the application.
 * @param {String} title - the title of the "page" being navigated to
 * @param {String} hash - the hash (URL) to be navigated to.
 * @return {Object} new_state - state with hash updated to the *new* hash.
 * @example
 * // returns the state object with updated hash value:
 * var new_state = elmish.route(model, 'Active', '#/active');
 */
export function route(model, title, hash) {
    window.location.hash = hash;
    const new_state = JSON.parse(JSON.stringify(model)); // clone model
    new_state.hash = hash;
    return new_state;
}
/* module.exports is needed to run the functions using Node.js for testing! */
/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        add_attributes,
        append_childnodes,
        a,
        button,
        div,
        empty,
        footer,
        input,
        h1,
        header,
        label,
        li,
        mount,
        route,
        section,
        span,
        strong,
        text,
        ul
    };
}
