import sync from './sync'

const help = `
Usage: exh data schemas [command] | <options>

Commands
  - sync                Synchronize a directory containing data service schema's

Options
  -h,--help             Documentation

Please visit: https://docs.extrahorizon.com/extrahorizon-cli/ for more information.
`;

export default async function schemas(arg:string[]){
    const command = arg[0];
    switch(command){
        case 'sync': await sync(arg.slice(1)); break;
        case '-h': 
        case '--help':
        case undefined:
            console.log("\x1b[33m",help);
        break;
        default: console.log(`error Command "${command}" not found.\ninfo Visit https://docs.extrahorizon.com/extrahorizon-cli/ for documentation about this command.`); break;

    }
}