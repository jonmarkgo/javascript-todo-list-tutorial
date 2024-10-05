/**
 * `empty` the contents of a given DOM element "node" (before re-rendering).
 * This is the *fastest* way according to: stackoverflow.com/a/3955238/1148249
 * @param  {Object} node the exact DOM node you want to empty the contents of.
 * @example
 * // returns true (once the 'app' node is emptied)
 * const node = document.getElementById('app');
 * empty(node);
 */
declare function empty(node: HTMLElement): void;
type Model = any;
type Update<T> = (action: string, model: T, data?: any) => T;
type View<T> = (model: T, signal: SignalFunction<T>) => HTMLElement;
type SignalFunction<T> = (action: string, data?: any, model?: T) => () => void;
/**
 * `mount` mounts the app in the "root" DOM Element.
 */
declare function mount<T extends Model>(model: T, update: Update<T>, view: View<T>, root_element_id: string, subscriptions?: (signal: SignalFunction<T>) => void): void;
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
declare function add_attributes(attrlist: (string | Function)[], node: HTMLElement): HTMLElement;
/**
 * `append_childnodes` appends an array of HTML elements to a parent DOM node.
 * @param  {Array.<Object>} childnodes array of child DOM nodes.
 * @param  {Object} parent the "parent" DOM node where children will be added.
 * @return {Object} returns parent DOM node with appended children
 * @example
 * // returns the parent node with the "children" appended
 * var parent = elmish.append_childnodes([div, p, section], parent);
 */
declare function append_childnodes(childnodes: HTMLElement[], parent: HTMLElement): HTMLElement;
/**
 * section creates a <section> HTML element with attributes and childnodes
 * @param {Array.<String>} attrlist list of attributes to be applied to the node
 * @param {Array.<Object>} childnodes array of child DOM nodes.
 * @return {Object} returns the <section> DOM node with appended children
 * @example
 * // returns <section> DOM element with attributes applied & children appended
 * var section = elmish.section(["class=todoapp"], [h1, input]);
 */
declare function section(attrlist: (string | Function)[], childnodes: HTMLElement[]): HTMLElement;
declare function a(attrlist: (string | Function)[], childnodes: HTMLElement[]): HTMLElement;
declare function button(attrlist: (string | Function)[], childnodes: HTMLElement[]): HTMLElement;
declare function div(attrlist: (string | Function)[], childnodes: HTMLElement[]): HTMLElement;
declare function footer(attrlist: (string | Function)[], childnodes: HTMLElement[]): HTMLElement;
declare function header(attrlist: (string | Function)[], childnodes: HTMLElement[]): HTMLElement;
declare function h1(attrlist: (string | Function)[], childnodes: HTMLElement[]): HTMLElement;
declare function input(attrlist: (string | Function)[], childnodes: HTMLElement[]): HTMLElement;
declare function label(attrlist: (string | Function)[], childnodes: HTMLElement[]): HTMLElement;
declare function li(attrlist: (string | Function)[], childnodes: HTMLElement[]): HTMLElement;
declare function span(attrlist: (string | Function)[], childnodes: HTMLElement[]): HTMLElement;
declare function strong(text_str: string): HTMLElement;
declare function text(text: string): HTMLElement;
declare function ul(attrlist: (string | Function)[], childnodes: HTMLElement[]): HTMLElement;
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
declare function route<T extends {
    hash?: string;
}>(model: T, title: string, hash: string): T;
export { add_attributes, append_childnodes, a, button, div, empty, footer, input, h1, header, label, li, mount, route, section, span, strong, text, ul };
