import tasks from './tasks';
import data from './data';

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