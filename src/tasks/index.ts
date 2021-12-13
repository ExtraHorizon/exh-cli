import functions from './functions';

const help = `
Usage: exh tasks [command] | <options>

Commands
  - functions               Provides a list subcommands to interact and manage functions

Options
  -h,--help                 Help documentation

Please visit: https://docs.extrahorizon.com/extrahorizon-cli/ for more information.
`;

export default async function tasks(arg:string[]){
    const command = arg[0];
    switch(command){
        case 'functions': await functions(arg.slice(1)); break;
        case '-h': 
        case '--help':
        case undefined:
            console.log("\x1b[33m",help);
        break;
        default: console.log(`error Command "${command}" not found.\ninfo Visit https://docs.extrahorizon.com/extrahorizon-cli/ for documentation about this command.`); break;

    }
}