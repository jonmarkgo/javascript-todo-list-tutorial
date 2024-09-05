"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Zero Dependencies Node.js HTTP Server for running static on localhost
var http = require("http");
var fs = require("fs");
var path = require("path");
console.log('cwd', __dirname);
var index = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
var favicon = fs.readFileSync(path.resolve(__dirname, '../dist/favicon.ico'));
var bundle = fs.readFileSync(path.resolve(__dirname, '../dist/bundle.js'), 'utf8');
var appcss = fs.readFileSync(path.resolve(__dirname, '../dist/todomvc-app.css'), 'utf8');
var basecss = fs.readFileSync(path.resolve(__dirname, '../dist/todomvc-common-base.css'), 'utf8');
http.createServer(function (req, res) {
    console.log("URL:", req.url);
    if (req.url && req.url.indexOf('favicon') > -1) {
        res.writeHead(200, { 'Content-Type': 'image/x-icon' });
        res.end(favicon);
    }
    else if (req.url && req.url.indexOf('bundle.js') > -1) {
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(bundle);
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
