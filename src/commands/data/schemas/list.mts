import { epilogue } from '../../../helpers/util.mjs';

export const command = 'list';
export const desc = 'List all schemas';
export const builder = (yargs: any) => epilogue(yargs);

export const handler = async function list({ sdk, isTTY }) {
  const schemaListResponse = await sdk.raw.get('/data/v1/');
  if (schemaListResponse.data.data.length !== 0) {
    if (isTTY) {
      console.table(schemaListResponse.data.data.map((c:any) => ({ Id: c.id, Name: c.name, Description: c.description || '<none>' })));
    } else {
      schemaListResponse.data.data.forEach((f:any) => (console.log([f.id, f.name].join(','))));
    }
  }
};
