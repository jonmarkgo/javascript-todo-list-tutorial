"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// Zero Dependencies Node.js HTTP Server for running static on localhost
const http = __importStar(require("http"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
console.log('cwd', __dirname);
const index = fs.readFileSync(path.resolve(__dirname + '/../index.html'), 'utf8');
const favicon = fs.readFileSync(__dirname + '/favicon.ico');
const app = fs.readFileSync(__dirname + '/todo-app.ts', 'utf8');
const elmish = fs.readFileSync(__dirname + '/elmish.ts', 'utf8');
const appcss = fs.readFileSync(__dirname + '/todomvc-app.css', 'utf8');
const basecss = fs.readFileSync(__dirname + '/todomvc-common-base.css', 'utf8');
http.createServer((req, res) => {
    console.log("URL:", req.url);
    if (req.url && req.url.indexOf('favicon') > -1) {
        res.writeHead(200, { 'Content-Type': 'image/x-icon' });
        res.end(favicon);
    }
    else if (req.url && req.url.indexOf('.js') > -1) {
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        if (req.url.indexOf('elmish') > -1) {
            res.end(elmish);
        }
        else {
            res.end(app);
        }
    }
    else if (req.url && req.url.indexOf('.css') > -1) {
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
