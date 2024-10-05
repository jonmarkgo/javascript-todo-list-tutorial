export declare namespace Elmish {
    type AttributeValue = string | ((this: GlobalEventHandlers, ev: MouseEvent) => any);
    type ChildNode = HTMLElement | Text;
    type SignalFunction<T> = (action: string, data?: any, model?: T) => () => void;
    /**
     * `empty` the contents of a given DOM element "node" (before re-rendering).
     * This is the *fastest* way according to: stackoverflow.com/a/3955238/1148249
     * @param  {Object} node the exact DOM node you want to empty the contents of.
     * @example
     * // returns true (once the 'app' node is emptied)
     * const node = document.getElementById('app');
     * empty(node);
     */
    function empty(node: HTMLElement): void;
    type Model = any;
    type Update<T> = (action: string, model: T, data?: any) => T;
    type View<T> = (model: T, signal: SignalFunction<T>) => HTMLElement;
    /**
     * `mount` mounts the app in the "root" DOM Element.
     * @param {Object} model store of the application's state.
     * @param {Function} update how the application state is updated ("controller")
     * @param {Function} view function that renders HTML/DOM elements with model.
     * @param {String} root_element_id root DOM element in which the app is mounted
     * @param {Function} subscriptions any event listeners the application needs
     */
    function mount<T extends Model>(model: T, update: Update<T>, view: View<T>, root_element_id: string, subscriptions?: (signal: SignalFunction<T>) => void): void;
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
    function add_attributes(attrlist: AttributeValue[], node: HTMLElement): HTMLElement;
    /**
     * `append_childnodes` appends an array of HTML elements to a parent DOM node.
     * @param  {Array.<Object>} childnodes array of child DOM nodes.
     * @param  {Object} parent the "parent" DOM node where children will be added.
     * @return {Object} returns parent DOM node with appended children
     * @example
     * // returns the parent node with the "children" appended
     * var parent = elmish.append_childnodes([div, p, section], parent);
     */
    function append_childnodes(childnodes: ChildNode[], parent: HTMLElement): HTMLElement;
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
    function create_element(type: string, attrlist: AttributeValue[], childnodes: ChildNode[]): HTMLElement;
    function text(content: string): Text;
    function section(attrlist: AttributeValue[], childnodes: ChildNode[]): HTMLElement;
    function a(attrlist: AttributeValue[], childnodes: ChildNode[]): HTMLElement;
    function button(attrlist: AttributeValue[], childnodes: ChildNode[]): HTMLElement;
    function div(attrlist: AttributeValue[], childnodes: ChildNode[]): HTMLElement;
    function footer(attrlist: AttributeValue[], childnodes: ChildNode[]): HTMLElement;
    function header(attrlist: AttributeValue[], childnodes: ChildNode[]): HTMLElement;
    function h1(attrlist: AttributeValue[], childnodes: ChildNode[]): HTMLElement;
    function input(attrlist: AttributeValue[], childnodes: ChildNode[]): HTMLElement;
    function label(attrlist: AttributeValue[], childnodes: ChildNode[]): HTMLElement;
    function li(attrlist: AttributeValue[], childnodes: ChildNode[]): HTMLElement;
    function span(attrlist: AttributeValue[], childnodes: ChildNode[]): HTMLElement;
    function strong(attrlist: AttributeValue[], childnodes: ChildNode[]): HTMLElement;
    function ul(attrlist: AttributeValue[], childnodes: ChildNode[]): HTMLElement;
    function on_click(handler: (ev: MouseEvent) => void): AttributeValue;
    function route(path: string): boolean;
}
export default Elmish;
