import { epilogue } from '../../helpers/util';
import * as templateService from '../../services/templates';

export const command = 'delete';
export const desc = 'Delete a template';
export const builder = (yargs: any) => epilogue(yargs)
  .options({
    name: {
      description: 'Name of the template to delete',
      type: 'string',
    },
    id: {
      description: 'ID of the template to delete',
      type: 'string',
    },
  })
  .check(({ id, name }) => {
    if ((!id && !name) || (id && name)) {
      throw new Error('Either id or name needs to be provided');
    }
    return true;
  });

export const handler = async function list({ name, id }: { name?: string; id?: string; }) {
  await templateService.remove(name, id);
};
