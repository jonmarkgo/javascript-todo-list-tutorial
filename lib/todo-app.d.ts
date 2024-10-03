// Type declarations for todo-app.js

import { Todo, Model } from './types';

export const model: Model;

export function render_item(todo: Todo, model: Model, signal: (action: string, data: any) => void): HTMLElement;

export function render_main(model: Model, signal: (action: string, data: any) => void): HTMLElement;

export function render_footer(model: Model): HTMLElement;

export function update(action: string, model: Model, data?: any): Model;

export function render(model: Model, signal: (action: string, data: any) => void): HTMLElement;

export function add_todo(model: Model, title: string): Model;

export function toggle_all(model: Model): Model;

export function toggle(model: Model, id: number): Model;

export function destroy(model: Model, id: number): Model;

export function clear_completed(model: Model): Model;

export function edit(model: Model, id: number, title: string): Model;

export function save(model: Model, id: number, title: string): Model;

export function cancel(model: Model): Model;

export function set_route(model: Model, hash: string): Model;
