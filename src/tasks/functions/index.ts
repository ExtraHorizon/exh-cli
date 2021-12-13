import create from './create';
import update from './update';
import ExH from '../../exh';

export default async function functions(arg:string[]){
    const command = arg[0];
    switch(command){
        case 'create': await create(arg.slice(1)); break;
        case 'list' : await list(); break;
        case 'update': await update(arg.slice(1)); break;
        case 'delete': await del(arg.slice(1)); break;
        default: console.log('Please aspecifiy a command'); break;
    }
}

export async function list() {
    const sdk = await ExH();
    const functionResponse = await sdk.raw.get('/tasks/v1/functions');
    if(functionResponse.data.data.length!=0) {
        functionResponse.data.data.forEach(f=>console.log(f.name));
    }
}

export async function del(arg:string[]) {
    const functionName = arg[0];
    if(!functionName) throw new Error('Please provide a function name => `exh tasks create yourFunctionName <options>`');
    if(!/^[A-Za-z0-9]+/g.test(functionName)) throw new Error('please only alphanumberic characters for your function name');

    const sdk = await ExH();
    const response = await sdk.raw.delete(`/tasks/v1/functions/${functionName}`);
    console.log(response.data);
}