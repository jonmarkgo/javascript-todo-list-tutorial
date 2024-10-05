"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = update;
exports.view = view;
exports.subscriptions = subscriptions;
const elmish_1 = require("./elmish");
function update(msg, model, data) {
    // Simplified update function
    return model;
}
function view(model) {
    // Simplified view function
    const div = document.createElement('div');
    div.appendChild((0, elmish_1.text)('Todo App'));
    return div;
}
function subscriptions(model) {
    // Simplified subscriptions function
}
//# sourceMappingURL=todo-app-test.js.map