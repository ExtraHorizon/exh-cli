import ExH from '../../exh';

const help = `
Usage: exh tasks functions delete <functionName>

Options
  -h,--help             Documentation

Please visit: https://docs.extrahorizon.com/extrahorizon-cli/ for more information.
`;

export default async function del(arg:string[]) {
    const command = arg[0];
    switch(command){
        case '-h': 
        case '--help':
        case undefined:
            console.log("\x1b[33m",help);
        break;
        default: await deleteFunction(arg); break;

    }
}

export async function deleteFunction(arg:string[]) {
    const functionName = arg[0];
    if(!functionName) throw new Error('Please provide a function name => `exh tasks create yourFunctionName <options>`');
    if(!/^[A-Za-z0-9]+/g.test(functionName)) throw new Error('please only alphanumberic characters for your function name');

    const sdk = await ExH();
    const response = await sdk.raw.delete(`/tasks/v1/functions/${functionName}`);
    console.log(response.data);
}