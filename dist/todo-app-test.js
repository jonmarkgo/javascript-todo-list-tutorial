import { text } from './elmish';
function update(msg, model, data) {
    // Simplified update function
    return model;
}
function view(model) {
    // Simplified view function
    const div = document.createElement('div');
    div.appendChild(text('Todo App'));
    return div;
}
function subscriptions(model) {
    // Simplified subscriptions function
}
export { update, view, subscriptions };
//# sourceMappingURL=todo-app-test.js.map