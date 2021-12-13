import schemas from './schemas';

const help = `
Usage: exh data [command] | <options>

Commands
  - schemas             Provides a list subcommands to interact and manage schemas

Options
 -h,--help              Documentation

Please visit: https://docs.extrahorizon.com/extrahorizon-cli/ for more information.
`;

export default async function data(arg:string[]){
    const command = arg[0];
    switch(command){
        case 'schemas': await schemas(arg.slice(1)); break;
        case '-h': 
        case '--help':
        case undefined:
            console.log(help);
        break;
        default: console.log(`error Command "${command}" not found.\ninfo Visit https://docs.extrahorizon.com/extrahorizon-cli/ for documentation about this command.`); break;

    }
}