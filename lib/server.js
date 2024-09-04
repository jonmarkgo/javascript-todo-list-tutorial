// Zero Dependencies Node.js HTTP Server for running static on localhost
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';

console.log('cwd', __dirname);

const index: string = fs.readFileSync(path.resolve(__dirname + '/../index.html'), 'utf8');
const favicon: Buffer = fs.readFileSync(__dirname + '/favicon.ico');
const app: string = fs.readFileSync(__dirname + '/todo-app.ts', 'utf8');
const elmish: string = fs.readFileSync(__dirname + '/elmish.ts', 'utf8');
const appcss: string = fs.readFileSync(__dirname + '/todomvc-app.css', 'utf8');
const basecss: string = fs.readFileSync(__dirname + '/todomvc-common-base.css', 'utf8');

http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
  console.log("URL:", req.url);
  if (req.url && req.url.indexOf('favicon') > -1) {
    res.writeHead(200, {'Content-Type': 'image/x-icon'});
    res.end(favicon);
  } else if (req.url && req.url.indexOf('.ts') > -1) {
    res.writeHead(200, {'Content-Type': 'application/javascript'});
    if (req.url.indexOf('elmish') > -1) {
      res.end(elmish);
    } else {
      res.end(app);
    }
  } else if (req.url && req.url.indexOf('.css') > -1) {
    res.writeHead(200, {'Content-Type': 'text/css'});
    if (req.url.indexOf('base') > -1) {
      res.end(basecss);
    } else {
      res.end(appcss);
    }
  } else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(index);
  }
}).listen(process.env.PORT || 8000);
