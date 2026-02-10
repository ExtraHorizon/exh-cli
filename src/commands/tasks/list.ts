import { epilogue } from '../../helpers/util';
import * as functionRepository from '../../repositories/functions';

export const command = 'list';
export const desc = 'List all tasks';
export const builder = (yargs: any) => epilogue(yargs);

export const handler = async function list({ isTTY }) {
  let functions: any[];
  try {
    functions = await functionRepository.find();
  } catch (err) {
    console.log(err);
    return;
  }

  if (functions.length < 1) {
    return;
  }

  if (isTTY) {
    console.table(functions.map((c:any) => ({
      Name: c.name,
      Description: c.description || '<none>',
      'Last updated': c.updateTimestamp.toISOString(),
    })));
  } else {
    functions.forEach((f:any) => (console.log(f.name)));
  }
};
