export var Elmish;
(function (Elmish) {
    /**
     * `empty` the contents of a given DOM element "node" (before re-rendering).
     * This is the *fastest* way according to: stackoverflow.com/a/3955238/1148249
     * @param  {Object} node the exact DOM node you want to empty the contents of.
     * @example
     * // returns true (once the 'app' node is emptied)
     * const node = document.getElementById('app');
     * empty(node);
     */
    function empty(node) {
        while (node.lastChild) {
            node.removeChild(node.lastChild);
        }
    } // this function produces a (DOM) "mutation" but has no other "side effects".
    Elmish.empty = empty;
    /**
     * `mount` mounts the app in the "root" DOM Element.
     * @param {Object} model store of the application's state.
     * @param {Function} update how the application state is updated ("controller")
     * @param {Function} view function that renders HTML/DOM elements with model.
     * @param {String} root_element_id root DOM element in which the app is mounted
     * @param {Function} subscriptions any event listeners the application needs
     */
    function mount(model, update, view, root_element_id, subscriptions) {
        const ROOT = document.getElementById(root_element_id);
        if (!ROOT)
            throw new Error(`Element with id ${root_element_id} not found`);
        const store_name = 'todos-elmish_' + root_element_id;
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
        render(model, signal, ROOT);
        if (subscriptions && typeof subscriptions === 'function') {
            subscriptions(signal);
        }
    }
    Elmish.mount = mount;
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
    function add_attributes(attrlist, node) {
        console.log('Attributes received:', attrlist);
        if (attrlist && Array.isArray(attrlist) && attrlist.length > 0) {
            attrlist.forEach(function (attr) {
                if (typeof attr === 'function') {
                    node.onclick = attr;
                    return;
                }
                if (typeof attr !== 'string') {
                    console.error('Invalid attribute type:', attr);
                    return;
                }
                if (attr === '') {
                    console.error('Empty string attribute received');
                    return;
                }
                const a = attr.split('=');
                if (a.length !== 2) {
                    console.error('Invalid attribute format:', attr);
                    return;
                }
                const [key, value] = a;
                switch (key) {
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
                        node.className = value;
                        break;
                    case 'data-id':
                        node.setAttribute('data-id', value);
                        break;
                    case 'for':
                        node.setAttribute('for', value);
                        break;
                    case 'href':
                        node.href = value;
                        break;
                    case 'id':
                        node.id = value;
                        break;
                    case 'placeholder':
                        node.placeholder = value;
                        break;
                    case 'style':
                        node.setAttribute("style", value);
                        break;
                    case 'type':
                        node.setAttribute('type', value);
                        break;
                    case 'value':
                        console.log('value:', value);
                        node.value = value;
                        break;
                    default:
                        node.setAttribute(key, value);
                        break;
                }
            });
        }
        return node;
    }
    Elmish.add_attributes = add_attributes;
    /**
     * `append_childnodes` appends an array of HTML elements to a parent DOM node.
     * @param  {Array.<Object>} childnodes array of child DOM nodes.
     * @param  {Object} parent the "parent" DOM node where children will be added.
     * @return {Object} returns parent DOM node with appended children
     * @example
     * // returns the parent node with the "children" appended
     * var parent = elmish.append_childnodes([div, p, section], parent);
     */
    function append_childnodes(childnodes, parent) {
        if (childnodes && Array.isArray(childnodes) && childnodes.length > 0) {
            childnodes.forEach(function (el) { parent.appendChild(el); });
        }
        return parent;
    }
    Elmish.append_childnodes = append_childnodes;
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
    Elmish.create_element = create_element;
    function text(content) {
        return document.createTextNode(content);
    }
    Elmish.text = text;
    // Helper functions to create HTML elements:
    function section(attrlist, childnodes) {
        return create_element('section', attrlist, childnodes);
    }
    Elmish.section = section;
    function a(attrlist, childnodes) {
        return create_element('a', attrlist, childnodes);
    }
    Elmish.a = a;
    function button(attrlist, childnodes) {
        return create_element('button', attrlist, childnodes);
    }
    Elmish.button = button;
    function div(attrlist, childnodes) {
        return create_element('div', attrlist, childnodes);
    }
    Elmish.div = div;
    function footer(attrlist, childnodes) {
        return create_element('footer', attrlist, childnodes);
    }
    Elmish.footer = footer;
    function header(attrlist, childnodes) {
        return create_element('header', attrlist, childnodes);
    }
    Elmish.header = header;
    function h1(attrlist, childnodes) {
        return create_element('h1', attrlist, childnodes);
    }
    Elmish.h1 = h1;
    function input(attrlist, childnodes) {
        return create_element('input', attrlist, childnodes);
    }
    Elmish.input = input;
    function label(attrlist, childnodes) {
        return create_element('label', attrlist, childnodes);
    }
    Elmish.label = label;
    function li(attrlist, childnodes) {
        return create_element('li', attrlist, childnodes);
    }
    Elmish.li = li;
    function span(attrlist, childnodes) {
        return create_element('span', attrlist, childnodes);
    }
    Elmish.span = span;
    function strong(attrlist, childnodes) {
        return create_element('strong', attrlist, childnodes);
    }
    Elmish.strong = strong;
    function ul(attrlist, childnodes) {
        return create_element('ul', attrlist, childnodes);
    }
    Elmish.ul = ul;
    function on_click(handler) {
        return function (ev) {
            ev.preventDefault();
            handler(ev);
        };
    }
    Elmish.on_click = on_click;
    function route(path) {
        return window.location.hash.slice(1) === path;
    }
    Elmish.route = route;
})(Elmish || (Elmish = {}));
export default Elmish;
//# sourceMappingURL=elmish.js.map