import { epilogue } from '../../../helpers/util';
import * as schemaService from '../../../services/schemas';

export const command = 'delete';
export const desc = 'Delete a schema';
export const builder = (yargs: any) => epilogue(yargs).option('id', {
  demandOption: true,
  description: 'The ID of the schema',
  type: 'string',
});

export const handler = async ({ id }) => {
  await schemaService.remove(id);
};
