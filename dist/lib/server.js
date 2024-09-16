var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Zero Dependencies Node.js HTTP Server for running static on localhost
import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log('cwd', __dirname);
const loadFile = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield fs.readFile(filePath, 'utf8');
    }
    catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        return null;
    }
});
const loadBinaryFile = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield fs.readFile(filePath);
    }
    catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        return null;
    }
});
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    const index = yield loadFile(path.resolve(__dirname, '../index.html'));
    const favicon = yield loadBinaryFile(path.resolve(__dirname, 'favicon.ico'));
    const app = yield loadFile(path.resolve(__dirname, 'todo-app.js'));
    const elmish = yield loadFile(path.resolve(__dirname, 'elmish.js'));
    const appcss = yield loadFile(path.resolve(__dirname, 'todomvc-app.css'));
    const basecss = yield loadFile(path.resolve(__dirname, 'todomvc-common-base.css'));
    http.createServer((req, res) => {
        console.log("URL:", req.url);
        if (req.url.indexOf('favicon') > -1) {
            res.writeHead(200, { 'Content-Type': 'image/x-icon' });
            res.end(favicon);
        }
        else if (req.url.indexOf('.js') > -1) {
            res.writeHead(200, { 'Content-Type': 'application/javascript' });
            if (req.url.indexOf('elmish') > -1) {
                res.end(elmish);
            }
            else {
                res.end(app);
            }
        }
        else if (req.url.indexOf('.css') > -1) {
            res.writeHead(200, { 'Content-Type': 'text/css' });
            if (req.url.indexOf('base') > -1) {
                res.end(basecss);
            }
            else {
                res.end(appcss);
            }
        }
        else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(index);
        }
    }).listen(process.env.PORT || 8000);
});
init().catch(error => console.error('Server initialization failed:', error));
