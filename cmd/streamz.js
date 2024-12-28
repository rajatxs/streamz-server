#!/usr/bin/env node
import { Command } from 'commander';
import { startCommand } from './start.js';
import { createUserCommand } from './create-user.js';

const cmd = new Command('streamz');
Reflect.set(global, 'config', {});

(function () {
    cmd.version('0.1.11', '-v, --version');
    cmd.description('Streamz media server');
    cmd.addCommand(startCommand);
    cmd.addCommand(createUserCommand);
    cmd.parse();
})();

export { cmd };
