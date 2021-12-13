import ExH from '../../exh';
import * as fs from 'fs';
import * as path from 'path';

import {extractOptions} from '../../helpers/options';

const help = `
Usage: exh tasks functions update <functionName> <options>

Options
  --code                Returns a list of existing functions
  --entryPoint          The name of the code function that should be invoked. example 'index.handler'
  --runtime             possible runtimes: nodejs12.x, nodejs14.x, python3.7, python3.8, python3.9, ruby2.7, java8, java11, go1.x, dotnetcore3.1
  --description         A description for this functions
  --timeLimit           A maximum timelimit for this function in seconds. min: 3 max: 300
  --memoryLimit         The allocated memory for this function. min: 128 max: 10240
  --env                 Environment Variables set for this function. This option can be used multiple times.
  -h,--help             Documentation

Please visit: https://docs.extrahorizon.com/extrahorizon-cli/ for more information.
`;

export default async function update(arg:string[]) {
    const command = arg[0];
    switch(command){
        case '-h': 
        case '--help':
        case undefined:
            console.log("\x1b[33m",help);
        break;
        default: await updateFunction(arg); break;

    }
}

export async function updateFunction(arg:string[]) {
    const functionName = arg[0];
    if(!functionName) throw new Error('Please provide a function name => `exh tasks update yourFunctionName <options>`');
    if(!/^[A-Za-z0-9]+/g.test(functionName)) throw new Error('please only alphanumberic characters for your function name');

    const options = extractUpdateFunctionOptions(arg.slice(1));

    const file = fs.readFileSync(path.join(process.cwd(), options.code));

    const sdk = await ExH();

    const reponse = await sdk.raw.put(`/tasks/v1/functions/${functionName}`,{
        name:functionName,
        description:options.description,
        code: file.toString('base64'),
        entryPoint: options.entryPoint,
        runtime: options.runtime,
        timeLimit: options.timeLimit,
        memoryLimit: options.memoryLimit,
        environmentVariables: options.env
    });
    console.log(reponse.data);
}

export function extractUpdateFunctionOptions(arg: string[]) {
    let options = extractOptions(arg,[
        { name:'description', required:false,schema:{type:'string',minLength:2,maxLength:200}},
        { name:'code', required:false ,schema:{type:'string',minLength:1,maxLength:200,pattern:'^.+\.zip$'}},
        { name:'entryPoint', required:false,schema:{type:'string',minLength:1,maxLength:200}},
        { name:'runtime', required:false,schema:{type:'string',enum:['nodejs12.x', 'nodejs14.x', 'python3.7', 'python3.8', 'python3.9', 'ruby2.7', 'java8', 'java11', 'go1.x', 'dotnetcore3.1' ]}},
        { name:'timeLimit', required:false, schema:{type:'number',minimum:3, maximum:300}},
        { name:'memoryLimit', required:false, schema:{type:'number',minimum:128, maximum:10240}},
        { name:'env', required:false, schema:{type:'string',pattern:'^([A-Za-z0-9-_]+)=(.)+$'}},
    ]);

    return options.reduce<UpdateFunctionOptions>((r,v)=>{
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

export interface UpdateFunctionOptions {
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