import functions from './functions';

export default async function tasks(arg:string[]){
    const command = arg[0];
    switch(command){
        case 'functions': await functions(arg.slice(1)); break;
        default: console.log('Please specifiy a command'); break;
    }
}