import ExH from '../../exh';

const help = `
Usage: exh tasks functions list

Options
  -h,--help             Documentation

Please visit: https://docs.extrahorizon.com/extrahorizon-cli/ for more information.
`;

export default async function list(arg:string[]) {
    const command = arg[0];
    switch(command){
        case '-h': 
        case '--help':
            console.log("\x1b[33m",help);
        break;
        default: await listFunctions(); break;

    }
}

export async function listFunctions() {
    const sdk = await ExH();
    const functionResponse = await sdk.raw.get('/tasks/v1/functions');
    if(functionResponse.data.data.length!=0) {
        functionResponse.data.data.forEach(f=>console.log(f.name));
    }
}