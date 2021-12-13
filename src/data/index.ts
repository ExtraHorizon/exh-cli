import schemas from './schemas';

export default async function data(arg:string[]){
    const command = arg[0];
    switch(command){
        case 'schemas': await schemas(arg.slice(1)); break;
        default: console.log('Please specifiy a command'); break;
    }
}