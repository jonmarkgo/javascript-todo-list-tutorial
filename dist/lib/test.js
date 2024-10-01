"use strict";
const id = 'test-app';
test('update({counters:[0]}) returns {counters:[0]} (current state unmodified)', function (assert) {
    const result = update({ counters: [0] });
    assert.equal(result.counters[0], 0);
});
test('Test Update increment: update(1, "inc") returns 2', function (assert) {
    const result = update({ counters: [1] }, "inc");
    console.log('result', result);
    assert.equal(result.counters[0], 2);
});
test('Test Update decrement: update(1, "dec") returns 0', function (assert) {
    const result = update({ counters: [1] }, "dec");
    assert.equal(result.counters[0], 0);
});
test('Test negative state: update(-9, "inc") returns -8', function (assert) {
    const result = update({ counters: [-9] }, "inc");
    assert.equal(result.counters[0], -8);
});
test('mount({model: 7, update: update}, "'
    + id + '") sets initial state to 7', function (assert) {
    var _a;
    mount({ counters: [7] }, update, id);
    const state = (_a = document.getElementById(id)) === null || _a === void 0 ? void 0 : _a.getElementsByClassName('count')[0].textContent;
    assert.equal(state, 7);
});
test('empty("test-app") should clear DOM in root node', function (assert) {
    var _a;
    empty(document.getElementById(id));
    mount({ counters: [7] }, update, id);
    empty(document.getElementById(id));
    const result = (_a = document.getElementById(id)) === null || _a === void 0 ? void 0 : _a.innerHTML;
    assert.equal(result, undefined);
});
test('click on "+" button to re-render state (increment model by 1)', function (assert) {
    var _a, _b, _c;
    document.body.appendChild(div(id));
    mount({ counters: [7] }, update, id);
    (_b = (_a = document.getElementById(id)) === null || _a === void 0 ? void 0 : _a.getElementsByClassName('inc')[0]) === null || _b === void 0 ? void 0 : _b.click();
    const state = (_c = document.getElementById(id)) === null || _c === void 0 ? void 0 : _c.getElementsByClassName('count')[0].textContent;
    assert.equal(state, 8); // model was incremented successfully
    empty(document.getElementById(id)); // clean up after tests
});
// Reset Functionality
test('Test reset counter when model/state is 6 returns 0', function (assert) {
    const result = update({ counters: [7] }, "reset");
    assert.equal(result.counters[0], 0);
});
test('reset button should be present on page', function (assert) {
    const reset = document.getElementsByClassName('reset');
    assert.equal(reset.length, 3);
});
test('Click reset button resets state to 0', function (assert) {
    mount({ counters: [7] }, update, id);
    const root = document.getElementById(id);
    assert.equal(root === null || root === void 0 ? void 0 : root.getElementsByClassName('count')[0].textContent, 7);
    const btn = root === null || root === void 0 ? void 0 : root.getElementsByClassName("reset")[0]; // click reset button
    btn === null || btn === void 0 ? void 0 : btn.click(); // Click the Reset button!
    const state = root === null || root === void 0 ? void 0 : root.getElementsByClassName('count')[0].textContent;
    assert.equal(state, 0); // state was successfully reset to 0!
    empty(root); // clean up after tests
});
