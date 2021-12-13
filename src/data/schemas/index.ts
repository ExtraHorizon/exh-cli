import {syncTargetDir} from './sync'
import * as path from 'path';

export default async function tasks(arg:string[]){
    const command = arg[0];
    switch(command){
        case 'sync': await sync(arg.slice(1)); break;
        default: console.log('Please specifiy a command'); break;
    }
}

export async function sync(arg:string[]){
    const relativePath = arg[0]? arg[0] : '.';
    const targetSchemaDir = path.join(process.cwd(), relativePath);

    try{
        await syncTargetDir(targetSchemaDir);
    }
    catch(e){
        console.log(e);
    }
}