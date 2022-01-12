import { epilogue } from '../../helpers/util';

export const command = 'list';
export const desc = 'List all tasks';
export const builder = (yargs: any) => epilogue(yargs);

export const handler = async function list({ sdk }) {
  const functionResponse = await sdk.raw.get('/tasks/v1/functions');
  if (functionResponse.data.data.length !== 0) {
    functionResponse.data.data.forEach((f:any) => console.log(f.name));
  }
};

