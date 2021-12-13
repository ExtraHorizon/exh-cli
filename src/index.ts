#! /usr/bin/env node

import tasks from './tasks';
import data from './data';

checkForNewVersion();

const help = `
ExtraHorizon cli

Usage: exh [command] | <options>

Commands
  - data                Provides a list of subcommands to interct with the data service                
  - tasks               Provides a list of subcommands ot interact with the task service

Options
  -h,--help              Help documentation

Please visit: https://docs.extrahorizon.com/extrahorizon-cli/ for more information.
`;

export async function exhCli() {
    try{
        const command = process.argv[2];
        switch(command){
            case 'tasks': await tasks(process.argv.slice(3)); break;
            case 'data': await data(process.argv.slice(3)); break;
            case '-h':
            case '--help':
            case undefined: 
                console.log("\x1b[33m",help);
                break;
            default: console.log(`error Command "${command}" not found.\ninfo Visit https://docs.extrahorizon.com/extrahorizon-cli/ for documentation about this command.`); break;
        }
    }
    catch(e){
        console.log(e.message);
        process.exit(1);
    }
}

function checkForNewVersion() {
    const updateNotifier = require('update-notifier');
    const pkg = require('../package.json');
  
    const notifier = updateNotifier({
      pkg,
      updateCheckInterval: 0
    });
  
    notifier.notify();
}

exhCli();