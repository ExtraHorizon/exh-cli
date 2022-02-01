import { epilogue } from '../../helpers/util';

export const command = 'list';
export const desc = 'List all tasks';
export const builder = (yargs: any) => epilogue(yargs);

export const handler = async function list({ sdk, isTTY }) {
  const functionResponse = await sdk.raw.get('/tasks/v1/functions');
  if (functionResponse.data.data.length !== 0) {
    if (isTTY) {
      console.table(functionResponse.data.data.map((c:any) => ({ Name: c.name, Description: c.Description || '<none>', 'Last updated': c.updateTimestamp.toISOString() })));
    } else {
      functionResponse.data.data.forEach((f:any) => (console.log(f.name)));
    }
  }
};
