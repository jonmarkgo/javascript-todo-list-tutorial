// Zero Dependencies Node.js HTTP Server for running static on localhost
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log('cwd', __dirname);
const index = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf8');
const app = fs.readFileSync(path.resolve(__dirname, './todo-app.js'), 'utf8');
const elmish = fs.readFileSync(path.resolve(__dirname, './elmish.js'), 'utf8');
const init = fs.readFileSync(path.resolve(__dirname, './init.js'), 'utf8');
const appcss = fs.readFileSync(path.resolve(__dirname, '../../lib/todomvc-app.css'), 'utf8');
const basecss = fs.readFileSync(path.resolve(__dirname, '../../lib/todomvc-common-base.css'), 'utf8');
http.createServer((req, res) => {
    console.log("Request URL:", req.url);
    if (req.url && req.url.indexOf('favicon') > -1) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Favicon not found');
    }
    else if (req.url && (req.url.endsWith('.js') || (req.url.indexOf('dist/lib/') > -1 && !path.extname(req.url)))) {
        console.log("Serving JavaScript file:", req.url);
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        if (req.url.indexOf('dist/lib/elmish') > -1) {
            console.log("Serving elmish.js");
            res.end(elmish);
        }
        else if (req.url.indexOf('dist/lib/todo-app') > -1) {
            console.log("Serving todo-app.js");
            res.end(app);
        }
        else if (req.url.indexOf('dist/lib/init') > -1) {
            console.log("Serving init.js");
            res.end(init);
        }
        else {
            console.log("JavaScript file not found:", req.url);
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('JavaScript file not found');
        }
    }
    else if (req.url && req.url.indexOf('.css') > -1) {
        console.log("Serving CSS file:", req.url);
        res.writeHead(200, { 'Content-Type': 'text/css' });
        if (req.url.indexOf('base') > -1) {
            res.end(basecss);
        }
        else {
            res.end(appcss);
        }
    }
    else {
        console.log("Serving index.html");
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(index);
    }
}).listen(process.env.PORT || 8000);
console.log('Server running at http://localhost:' + (process.env.PORT || 8000) + '/');
//# sourceMappingURL=server.js.map