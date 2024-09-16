import test, { Test } from 'tape';
import fs from 'fs';
import path from 'path';
import * as elmish from '../lib/elmish';
import { JSDOM } from 'jsdom';

const html: string = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8');
require('jsdom-global')(html);

const id: string = 'test-app';

// Import types from Elmish namespace
type Model = Elmish.Model;
type Action = Elmish.Action;
type UpdateFunction = Elmish.UpdateFunction;
type ViewFunction = Elmish.ViewFunction;
type SignalFunction = Elmish.SignalFunction;
