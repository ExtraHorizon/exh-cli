import { epilogue } from '../../helpers/util';
import * as templateService from '../../services/templates';

export const command = 'get';
export const desc = 'Fetch a template';
export const builder = (yargs: any) => epilogue(yargs)
  .options({
    name: {
      describe: 'Name of the template',
      type: 'string',
    },
    id: {
      describe: 'ID of the template',
      type: 'string',
    },
  })
  .check(({ name, id }) => {
    if ((name && id) || (!name && !id)) {
      throw new Error('Either name or id should be specified (but not both at the same time)');
    }
    return true;
  });

export const handler = async function list({ name, id }: { name?: string; id?: string; }) {
  await templateService.get(name, id);
};
