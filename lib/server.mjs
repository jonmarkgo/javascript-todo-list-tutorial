// Zero Dependencies Node.js HTTP Server for running static on localhost
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('cwd', __dirname);
const index = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
const favicon = fs.readFileSync(path.join(__dirname, 'favicon.ico'));
const app = fs.readFileSync(path.join(__dirname, '../dist/lib/todo-app.js'), 'utf8');
const elmish = fs.readFileSync(path.join(__dirname, '../dist/lib/elmish.js'), 'utf8');
const appcss = fs.readFileSync(path.join(__dirname, 'todomvc-app.css'), 'utf8');
const basecss = fs.readFileSync(path.join(__dirname, 'todomvc-common-base.css'), 'utf8');
http.createServer((req, res) => {
    console.log("URL:", req.url);
    let headersSent = false;

    const sendResponse = (statusCode, contentType, content) => {
        if (!headersSent) {
            res.writeHead(statusCode, { 'Content-Type': contentType });
            headersSent = true;
        }
        res.end(content);
    };

    if (req.url && req.url.indexOf('favicon') > -1) {
        sendResponse(200, 'image/x-icon', favicon);
    } else if (req.url && req.url.indexOf('.js') > -1) {
        if (req.url.indexOf('elmish') > -1) {
            sendResponse(200, 'application/javascript; charset=utf-8', elmish);
        } else {
            sendResponse(200, 'application/javascript; charset=utf-8', app);
        }
    } else if (req.url && req.url.indexOf('.css') > -1) {
        if (req.url.indexOf('base') > -1) {
            sendResponse(200, 'text/css', basecss);
        } else {
            sendResponse(200, 'text/css', appcss);
        }
    } else {
        sendResponse(200, 'text/html', index);
    }
}).listen(process.env.PORT || 8000);
