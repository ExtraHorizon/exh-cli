import create from './create';
import list from './list';
import update from './update';
import del from './delete';

const help = `
Usage: exh tasks functions [commands] | <options> 

Commands
  - create              For creating new functions
  - list                Returns a list of existing functions
  - update              For updating existing functions
  - delete              For deleting existing functions

Options
  -h,--help              Help documentation

Please visit: https://docs.extrahorizon.com/extrahorizon-cli/ for more information.
`;

export default async function functions(arg:string[]){
    const command = arg[0];
    switch(command){
        case 'create': await create(arg.slice(1)); break;
        case 'list' : await list(arg.slice(1)); break;
        case 'update': await update(arg.slice(1)); break;
        case 'delete': await del(arg.slice(1)); break;
        case '-h':
        case '--help':
        case undefined:
            console.log("\x1b[33m",help);
        break;
        default: console.log(`error Command "${command}" not found.\ninfo Visit https://docs.extrahorizon.com/extrahorizon-cli/ for documentation about this command.`); break;
    }
}