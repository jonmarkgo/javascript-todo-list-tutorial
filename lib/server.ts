import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Zero Dependencies Node.js HTTP Server for running static on localhost
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log('cwd', __dirname);

const index = fs.readFileSync(path.resolve(__dirname, '..', '..', 'index.html'), 'utf8');
const favicon = fs.readFileSync(path.resolve(__dirname, '..', '..', 'lib', 'favicon.ico'));
const app = fs.readFileSync(path.resolve(__dirname, '..', 'lib', 'todo-app.js'), 'utf8');
const elmish = fs.readFileSync(path.resolve(__dirname, '..', 'lib', 'elmish.js'), 'utf8');
const appcss = fs.readFileSync(path.resolve(__dirname, '..', '..', 'lib', 'todomvc-app.css'), 'utf8');
const basecss = fs.readFileSync(path.resolve(__dirname, '..', '..', 'lib', 'todomvc-common-base.css'), 'utf8');

const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
    console.log("URL:", req.url);
    if (req.url && req.url.indexOf('favicon') > -1) {
        res.writeHead(200, { 'Content-Type': 'image/x-icon' });
        res.end(favicon);
    } else if (req.url && req.url.indexOf('.js') > -1) {
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        if (req.url.indexOf('elmish') > -1) {
            res.end(elmish);
        } else {
            res.end(app);
        }
    } else if (req.url && req.url.indexOf('.css') > -1) {
        res.writeHead(200, { 'Content-Type': 'text/css' });
        if (req.url.indexOf('base') > -1) {
            res.end(basecss);
        } else {
            res.end(appcss);
        }
    } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(index);
    }
});

server.listen(process.env.PORT || 8000);

export default server;
