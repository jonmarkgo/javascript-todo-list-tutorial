export function empty(node: HTMLElement): void {
    while (node.lastChild) {
        node.removeChild(node.lastChild);
    }
}

export function mount<T>(model: T, update: (action: string, model: T, data?: any) => T, view: (model: T, signal: (action: string, data?: any) => () => void) => Node, root_element_id: string, subscriptions?: (signal: (action: string, data?: any) => () => void) => void): (action: string, data?: any) => () => void {
    console.log(`[MOUNT] Mounting app with root element id: ${root_element_id}`);
    const ROOT = document.getElementById(root_element_id);
    if (!ROOT) {
        console.error(`[MOUNT] Element with id "${root_element_id}" not found`);
        throw new Error(`Element with id "${root_element_id}" not found`);
    }
    const store_name = 'todos-elmish_' + root_element_id;
    console.log(`[MOUNT] Using localStorage key: ${store_name}`);
    function saveModelToLocalStorage(mod: T): void {
        try {
            const serializedModel = JSON.stringify(mod);
            localStorage.setItem(store_name, serializedModel);
            console.log('[SAVE] Model successfully saved to localStorage:', mod);
        }
        catch (e) {
            console.error(`[SAVE] Error saving model to localStorage (${store_name}):`, e);
        }
    }
    function getModelFromLocalStorage(): T | null {
        try {
            if (typeof localStorage === 'undefined') {
                console.warn('[GET] localStorage is not available');
                return null;
            }
            const storedModel = localStorage.getItem(store_name);
            if (storedModel === null) {
                console.log(`[GET] No stored model found for ${store_name}`);
                return null;
            }
            const parsedModel = JSON.parse(storedModel) as T;
            console.log('[GET] Retrieved stored model:', parsedModel);
            return parsedModel;
        }
        catch (e) {
            console.error(`[GET] Error retrieving or parsing model from localStorage (${store_name}):`, e);
            return null;
        }
    }
    function render(mod: T, sig: (action: string, data?: any) => () => void, root: HTMLElement, callback?: () => void): void {
        console.log('[RENDER] Rendering view with model:', mod);
        empty(root);
        const viewResult = view(mod, sig);
        console.log('[RENDER] View function result:', viewResult);
        root.appendChild(viewResult);
        console.log('[RENDER] View rendered and appended to root');
        saveModelToLocalStorage(mod);
        if (callback) {
            console.log('[RENDER] Scheduling callback');
            setTimeout(() => {
                console.log('[RENDER] Executing callback');
                callback();
            }, 0);
        }
    }
    let currentModel: T;
    function signal(action: string, data?: any): () => void {
        return function callback(): void {
            console.log(`[SIGNAL] Signal called with action: ${action}, data:`, data);
            console.log('[SIGNAL] Current model before update:', currentModel);
            try {
                const updatedModel = update(action, currentModel, data);
                console.log('[SIGNAL] Model updated:', updatedModel);
                if (ROOT) {
                    currentModel = updatedModel;
                    render(currentModel, signal, ROOT, () => {
                        console.log('[RENDER] DOM updated after action:', action);
                        console.log('[RENDER] Current model after update:', currentModel);
                        saveModelToLocalStorage(currentModel);
                    });
                }
                else {
                    console.error('[SIGNAL] Root element is null, cannot render view');
                }
            }
            catch (e) {
                console.error(`[SIGNAL] Error updating model for action: ${action}`, e);
            }
        };
    }
    // Initialize the model
    const storedModel = getModelFromLocalStorage();
    if (storedModel !== null) {
        console.log('[INIT] Using stored model from localStorage:', storedModel);
        currentModel = storedModel;
    }
    else {
        console.log(`[INIT] Using provided initial model:`, model);
        currentModel = model;
    }
    try {
        console.log('[INIT] Initial render with model:', currentModel);
        render(currentModel, signal, ROOT);
        if (subscriptions && typeof subscriptions === 'function') {
            console.log('[INIT] Initializing subscriptions');
            subscriptions(signal);
        }
        else {
            console.log('[INIT] No subscriptions provided');
        }
    }
    catch (e) {
        console.error('[ERROR] Error during mount process:', e);
        // Implement a basic fallback rendering
        ROOT.innerHTML = '<p>An error occurred while mounting the application.</p>';
        throw e; // Re-throw the error after fallback rendering
    }
    console.log('[MOUNT] Mount process completed, returning signal function');
    return signal; // Return the signal function
}

export function add_attributes(attrlist: (string | Function)[], node: HTMLElement): HTMLElement {
    console.log('[ADD_ATTRIBUTES] Processing attributes for node:', node.tagName);
    console.log('[ADD_ATTRIBUTES] Attribute list:', JSON.stringify(attrlist));

    if (!attrlist || !Array.isArray(attrlist)) {
        console.warn('[ADD_ATTRIBUTES] Invalid attribute list, skipping attribute processing');
        return node;
    }

    function isValidAttributeName(name: string): boolean {
        if (!name || typeof name !== 'string') {
            console.warn(`[ADD_ATTRIBUTES] Invalid attribute name: ${name}, type: ${typeof name}`);
            return false;
        }
        const trimmedName = name.trim().toLowerCase();
        if (trimmedName === '') {
            console.warn(`[ADD_ATTRIBUTES] Empty attribute name after trimming`);
            return false;
        }
        const validNameRegex = /^[a-z][a-z0-9\-_:]*$/i;
        const isValid = validNameRegex.test(trimmedName);
        if (!isValid) {
            console.warn(`[ADD_ATTRIBUTES] Invalid attribute name: "${trimmedName}", does not match regex: ${validNameRegex}`);
        } else {
            console.log(`[ADD_ATTRIBUTES] Valid attribute name: "${trimmedName}"`);
        }
        return isValid;
    }

    function safeSetAttribute(node: HTMLElement, key: string, value: string): void {
        console.log(`[ADD_ATTRIBUTES] Attempting to set attribute: key="${key}", value="${value}"`);

        const trimmedKey = key.trim().toLowerCase();
        const trimmedValue = String(value).trim();

        if (!trimmedKey || !isValidAttributeName(trimmedKey)) {
            console.warn(`[ADD_ATTRIBUTES] Invalid attribute name: "${trimmedKey}", skipping`);
            return;
        }

        const booleanAttributes = ['checked', 'selected', 'disabled', 'readonly', 'multiple', 'ismap', 'defer', 'autofocus', 'required', 'hidden'];
        if (booleanAttributes.includes(trimmedKey)) {
            console.log(`[ADD_ATTRIBUTES] Handling boolean attribute: ${trimmedKey}`);
            if (trimmedValue === 'true' || trimmedValue === '') {
                node.setAttribute(trimmedKey, '');
            } else {
                node.removeAttribute(trimmedKey);
            }
            console.log(`[ADD_ATTRIBUTES] Boolean attribute ${trimmedKey} set to ${trimmedValue === 'true' || trimmedValue === ''}`);
            return;
        }

        if (trimmedValue === '') {
            if (['class', 'id', 'name', 'value'].includes(trimmedKey)) {
                console.log(`[ADD_ATTRIBUTES] Setting empty value for essential attribute "${trimmedKey}"`);
            } else {
                console.warn(`[ADD_ATTRIBUTES] Empty value for non-essential attribute "${trimmedKey}", skipping`);
                return;
            }
        }

        try {
            console.log(`[ADD_ATTRIBUTES] Setting attribute: node=${node.tagName}, key="${trimmedKey}", value="${trimmedValue}"`);
            if (trimmedKey === 'class') {
                node.className = trimmedValue;
            } else if (trimmedKey === 'style') {
                node.style.cssText = trimmedValue;
            } else {
                node.setAttribute(trimmedKey, trimmedValue);
            }
            console.log(`[ADD_ATTRIBUTES] Successfully set attribute: ${trimmedKey}="${trimmedValue}"`);
        } catch (error) {
            console.error(`[ADD_ATTRIBUTES] Error setting attribute ${trimmedKey}:`, error);
            if (error instanceof DOMException) {
                console.error(`[ADD_ATTRIBUTES] DOMException: ${error.message}`);
            } else {
                console.error(`[ADD_ATTRIBUTES] Unexpected error:`, error);
            }
            console.error(`[ADD_ATTRIBUTES] Failed attribute details: node=${node.tagName}, key="${trimmedKey}", value="${trimmedValue}"`);
        }
    }

    function parseAttribute(attr: string | Function): { key: string, value: string | Function } | null {
        console.log('[ADD_ATTRIBUTES] Parsing attribute:', typeof attr === 'function' ? 'Function' : attr);
        if (typeof attr === 'function') {
            console.log('[ADD_ATTRIBUTES] Attribute is a function, treating as event handler');
            return { key: 'event', value: attr };
        }
        if (typeof attr !== 'string') {
            console.warn('[ADD_ATTRIBUTES] Invalid attribute type:', typeof attr);
            return null;
        }

        const trimmedAttr = attr.trim();
        if (!trimmedAttr) {
            console.warn('[ADD_ATTRIBUTES] Empty attribute string after trimming, skipping');
            return null;
        }

        const equalIndex = trimmedAttr.indexOf('=');
        if (equalIndex === -1) {
            // Handle boolean attributes without values
            const key = trimmedAttr.toLowerCase();
            if (!isValidAttributeName(key)) {
                console.warn(`[ADD_ATTRIBUTES] Invalid boolean attribute name: "${key}", skipping. Full attribute: "${attr}"`);
                return null;
            }
            console.log(`[ADD_ATTRIBUTES] Parsed boolean attribute - key: "${key}"`);
            return { key, value: '' }; // Set value to empty string for boolean attributes
        }

        const key = trimmedAttr.slice(0, equalIndex).trim().toLowerCase();
        const value = trimmedAttr.slice(equalIndex + 1).trim();

        if (!key) {
            console.warn(`[ADD_ATTRIBUTES] Empty attribute name after trimming, skipping. Full attribute: "${attr}"`);
            return null;
        }

        if (!isValidAttributeName(key)) {
            console.warn(`[ADD_ATTRIBUTES] Invalid attribute name: "${key}", skipping. Full attribute: "${attr}"`);
            return null;
        }

        if (value === '' && !['class', 'id', 'name'].includes(key)) {
            console.warn(`[ADD_ATTRIBUTES] Empty attribute value for non-essential attribute: "${key}", skipping. Full attribute: "${attr}"`);
            return null;
        }

        console.log(`[ADD_ATTRIBUTES] Parsed attribute - key: "${key}", value: "${value}"`);
        return { key, value };
    }

    function setEventHandler(node: HTMLElement, eventName: string, handlerValue: string | Function): void {
        console.log(`[ADD_ATTRIBUTES] Setting event handler for ${eventName}`);
        const eventHandler = typeof handlerValue === 'function'
            ? handlerValue
            : (event: Event) => {
                try {
                    const functionBody = handlerValue.toString().replace(/^function\s*\([^)]*\)\s*{/, '').replace(/}$/, '').trim();
                    if (functionBody) {
                        new Function('event', functionBody)(event);
                    } else {
                        console.warn(`[ADD_ATTRIBUTES] Empty event handler for ${eventName}, skipping`);
                    }
                } catch (error) {
                    console.error('[ADD_ATTRIBUTES] Error in event handler execution:', error);
                }
            };
        node.addEventListener(eventName, eventHandler as EventListener);
        console.log(`[ADD_ATTRIBUTES] Successfully set event handler for ${eventName}`);
    }

    try {
        const parsedAttributes = attrlist
            .map(parseAttribute)
            .filter((attr): attr is NonNullable<typeof attr> => attr !== null && attr.key !== '');
        console.log('[ADD_ATTRIBUTES] Parsed attributes:', parsedAttributes);

        parsedAttributes.forEach((attr, index) => {
            console.log(`[ADD_ATTRIBUTES] Processing attribute ${index + 1}/${parsedAttributes.length}:`, attr);

            try {
                if (attr.key === 'event' || attr.key.startsWith('on')) {
                    console.log('[ADD_ATTRIBUTES] Processing event handler');
                    const eventName = attr.key === 'event' ? 'click' : attr.key.slice(2);
                    setEventHandler(node, eventName, attr.value);
                } else {
                    const attributeValue = attr.value?.toString() ?? '';
                    safeSetAttribute(node, attr.key, attributeValue);
                }
            } catch (error) {
                console.error(`[ADD_ATTRIBUTES] Error processing attribute ${attr.key}:`, error);
                if (error instanceof DOMException) {
                    console.error(`[ADD_ATTRIBUTES] DOMException: ${error.message}`);
                } else {
                    console.error(`[ADD_ATTRIBUTES] Unexpected error:`, error);
                }
            }
        });

        console.log('[ADD_ATTRIBUTES] Finished processing attributes for node:', node.tagName);
    } catch (error) {
        console.error('[ADD_ATTRIBUTES] Unexpected error in add_attributes function:', error);
    }

    return node;
}

/**
 * `append_childnodes` appends an array of HTML elements to a parent DOM node.
 * @param  {Array.<Node>} childnodes array of child DOM nodes.
 * @param  {Node} parent the "parent" DOM node where children will be added.
 * @return {Node} returns parent DOM node with appended children
 * @example
 * // returns the parent node with the "children" appended
 * var parent = elmish.append_childnodes([div, p, section], parent);
 */
function append_childnodes(childnodes: Node[], parent: Node): Node {
    if (childnodes && Array.isArray(childnodes) && childnodes.length > 0) {
        childnodes.forEach((el) => { parent.appendChild(el); });
    }
    return parent;
}

/**
 * create_element is a "helper" function to "DRY" HTML element creation code
 * create *any* element with attributes and childnodes.
 * @param {string} type of element to be created e.g: 'div', 'section'
 * @param {Array<string>} attrlist list of attributes to be applied to the node
 * @param {Array<Node>} childnodes array of child DOM nodes.
 * @return {HTMLElement} returns the DOM node with appended children
 * @example
 * // returns the parent node with the "children" appended
 * var div = elmish.create_element('div', ["class=todoapp"], [h1, input]);
 */
function create_element(type: string, attrlist: string[], childnodes: Node[]): HTMLElement {
    console.log(`[CREATE_ELEMENT] Creating ${type} element`);
    console.log(`[CREATE_ELEMENT] Attributes:`, attrlist);
    console.log(`[CREATE_ELEMENT] Number of child nodes:`, childnodes.length);

    const element = document.createElement(type);
    const elementWithAttributes = add_attributes(attrlist, element);
    const finalElement = append_childnodes(childnodes, elementWithAttributes);

    console.log(`[CREATE_ELEMENT] Element created:`, finalElement);
    return finalElement as HTMLElement;
}

function section(attrlist: string[], childnodes: Node[]): HTMLElement {
    console.log('[SECTION] Creating section with attributes:', attrlist);
    return create_element('section', attrlist, childnodes);
}

function a(attrlist: string[], childnodes: Node[]): HTMLElement {
    console.log('[A] Creating anchor with attributes:', attrlist);
    return create_element('a', attrlist, childnodes);
}

function button(attrlist: string[], childnodes: Node[]): HTMLElement {
    console.log('[BUTTON] Creating button with attributes:', attrlist);
    return create_element('button', attrlist, childnodes);
}

function div(attrlist: string[], childnodes: Node[]): HTMLElement {
    console.log('[DIV] Creating div with attributes:', attrlist);
    return create_element('div', attrlist, childnodes);
}

function footer(attrlist: string[], childnodes: Node[]): HTMLElement {
    console.log('[FOOTER] Creating footer with attributes:', attrlist);
    return create_element('footer', attrlist, childnodes);
}

function header(attrlist: string[], childnodes: Node[]): HTMLElement {
    console.log('[HEADER] Creating header with attributes:', attrlist);
    return create_element('header', attrlist, childnodes);
}

function h1(attrlist: string[], childnodes: Node[]): HTMLElement {
    console.log('[H1] Creating h1 with attributes:', attrlist);
    return create_element('h1', attrlist, childnodes);
}

function input(attrlist: string[], childnodes: Node[]): HTMLElement {
    console.log('[INPUT] Creating input with attributes:', attrlist);
    return create_element('input', attrlist, childnodes);
}

function label(attrlist: string[], childnodes: Node[]): HTMLElement {
    console.log('[LABEL] Creating label with attributes:', attrlist);
    return create_element('label', attrlist, childnodes);
}

function li(attrlist: string[], childnodes: Node[]): HTMLElement {
    console.log('[LI] Creating li with attributes:', attrlist);
    return create_element('li', attrlist, childnodes);
}

function span(attrlist: string[], childnodes: Node[]): HTMLElement {
    return create_element('span', attrlist, childnodes);
}

function strong(text_str: string): HTMLElement {
    const el = document.createElement("strong");
    el.innerHTML = text_str;
    return el;
}

function text(text: string): Text {
    return document.createTextNode(text);
}

function ul(attrlist: string[], childnodes: Node[]): HTMLElement {
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
function route<T extends { hash: string }>(model: T, title: string, hash: string): T {
    window.location.hash = hash;
    const new_state = JSON.parse(JSON.stringify(model)) as T; // clone model
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

export {
    append_childnodes,
    create_element,
    section,
    a,
    button,
    div,
    footer,
    header,
    h1,
    input,
    label,
    li,
    span,
    strong,
    text,
    ul,
    route
};
