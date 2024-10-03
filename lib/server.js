// Zero Dependencies Node.js HTTP Server for running static on localhost
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
console.log('cwd', __dirname);
var index = fs.readFileSync(path.resolve(__dirname + '/../index.html'), 'utf8');
var favicon = fs.readFileSync(__dirname + '/favicon.ico');
var app = fs.readFileSync(__dirname + '/todo-app.js', 'utf8');
var elmish = fs.readFileSync(__dirname + '/elmish.js', 'utf8');
var appcss = fs.readFileSync(__dirname + '/todomvc-app.css', 'utf8');
var basecss = fs.readFileSync(__dirname + '/todomvc-common-base.css', 'utf8');
http.createServer(function (req, res) {
    console.log("URL:", req.url);
    if (req.url && req.url.indexOf('favicon') > -1) {
        res.writeHead(200, { 'Content-Type': 'image/x-icon' });
        res.end(favicon);
    }
    if (req.url && req.url.indexOf('.js') > -1) {
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        if (req.url.indexOf('elmish') > -1) {
            res.end(elmish);
        }
        else {
            res.end(app);
        }
    }
    if (req.url && req.url.indexOf('.css') > -1) {
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
