// Zero Dependencies Node.js HTTP Server for running static on localhost
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('cwd', __dirname);
const index = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');
const elmish = fs.readFileSync(path.resolve(__dirname, '..', 'dist', 'lib', 'elmish.js'), 'utf8');
const app = fs.readFileSync(path.resolve(__dirname, '..', 'dist', 'lib', 'todo-app.js'), 'utf8');
const favicon = fs.readFileSync(path.resolve(__dirname, 'favicon.ico'));
const basecss = fs.readFileSync(path.resolve(__dirname, '..', 'lib', 'todomvc-common-base.css'), 'utf8');
const appcss = fs.readFileSync(path.resolve(__dirname, '..', 'lib', 'todomvc-app.css'), 'utf8');

const server = http.createServer((req, res) => {
    console.log("URL:", req.url);
    if (req.url && req.url.includes('favicon')) {
        res.writeHead(200, { 'Content-Type': 'image/x-icon' });
        return res.end(favicon);
    }
    if (req.url && (req.url.endsWith('.js') || req.url.includes('/dist/lib/'))) {
        res.writeHead(200, {
            'Content-Type': 'application/javascript; charset=utf-8',
            'Content-Security-Policy': "script-src 'self' 'unsafe-inline'",
            'X-Content-Type-Options': 'nosniff'
        });
        if (req.url.includes('elmish')) {
            console.log("Serving elmish.js from", path.resolve(__dirname, '..', 'dist', 'lib', 'elmish.js'));
            return res.end(elmish);
        } else if (req.url.includes('todo-app')) {
            console.log("Serving todo-app.js from", path.resolve(__dirname, '..', 'dist', 'lib', 'todo-app.js'));
            return res.end(app);
        } else {
            console.log("JavaScript file not found:", req.url);
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            return res.end('Not Found');
        }
    }
    if (req.url && req.url.endsWith('.css')) {
        res.writeHead(200, { 'Content-Type': 'text/css' });
        return req.url.includes('base') ? res.end(basecss) : res.end(appcss);
    }
    res.writeHead(200, {
        'Content-Type': 'text/html',
        'Content-Security-Policy': "script-src 'self' 'unsafe-inline'"
    });
    return res.end(index);
});

const port = process.env.PORT || 8000;
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
