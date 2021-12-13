import tasks from './tasks';
import data from './data';

checkForNewVersion();

export async function exhCli() {
    try{
        const command = process.argv[2];
        switch(command){
            case 'tasks': await tasks(process.argv.slice(3)); break;
            case 'data': await data(process.argv.slice(3)); break;
            default: console.log('Please specifiy a command'); break;
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