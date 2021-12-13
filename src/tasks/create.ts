import ExH from '../exh';
import * as fs from 'fs';
import * as path from 'path';

import {extractOptions} from '../helpers/options';


export default async function create(arg:string[]) {
    const functionName = arg[0];
    if(!functionName) throw new Error('Please provide a function name => `exh tasks create yourFunctionName <options>`');
    if(!/^[A-Za-z0-9]+/g.test(functionName)) throw new Error('please only alphanumberic characters for your function name');

    const options = extractCreateFunctionOptions(arg.slice(1));

    const file = fs.readFileSync(path.join(process.cwd(), options.code));

    const sdk = await ExH();

    const functions = (await sdk.raw.get('/tasks/v1/functions')).data.data;
    const myFunction = functions.find(f=>f.name==functionName);
    if(myFunction) throw new Error('Your function already exists, please use the update command to update your function');

    const response = await sdk.raw.post('/tasks/v1/functions',{
        name:functionName,
        description:options.description,
        code: file.toString('base64'),
        entryPoint: options.entryPoint,
        runtime: options.runtime,
        timeLimit: options.timeLimit,
        memoryLimit: options.memoryLimit,
        environmentVariables: options.env
    });
    console.log(response.data);
}

export function extractCreateFunctionOptions(arg: string[]) {
    let options = extractOptions(arg,[
        { name:'description', required:false,schema:{type:'string',minLength:2,maxLength:200}},
        { name:'code', required:true ,schema:{type:'string',minLength:1,maxLength:200,pattern:'^.+\.zip$'}},
        { name:'entryPoint', required:true,schema:{type:'string',minLength:1,maxLength:200}},
        { name:'runtime', required:true,schema:{type:'string',enum:['nodejs12.x', 'nodejs14.x', 'python3.7', 'python3.8', 'python3.9', 'ruby2.7', 'java8', 'java11', 'go1.x', 'dotnetcore3.1' ]}},
        { name:'timeLimit', required:false, schema:{type:'number',minimum:3, maximum:300}},
        { name:'memoryLimit', required:true, schema:{type:'number',minimum:128, maximum:10240}},
        { name:'env', required:false, schema:{type:'string',pattern:'^([A-Za-z0-9-_]+)=(.)+$'}},
    ]);

    return options.reduce<CreateFunctionOptions>((r,v)=>{
        if(v.name!='env') {
            r[v.name]=v.value[0];
        }
        else{
            r[v.name]=v.value.reduce((r,v)=>{
                const envVar = v.split(/=(.+)/);
                r[envVar[0]]=envVar[1]
                return r;
            },{});
        }
        return r;
    },{
        code: undefined,
        entryPoint: undefined,
        runtime: undefined,
        memoryLimit: undefined,
    });
}

export interface CreateFunctionOptions {
    description?: string,
    code: string,
    entryPoint: string,
    runtime: string,
    timeLimit?: number,
    memoryLimit: number,
    env?: EnvironmentVariables
}

export interface EnvironmentVariables {
    [key:string]:{
        value: string;
    }
}