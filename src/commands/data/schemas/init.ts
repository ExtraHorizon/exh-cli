import { epilogue } from '../../../helpers/util';
import * as schemaService from '../../../services/schemas';

export const command = 'init <name>';
export const desc = 'Create a basic schema configuration file';
export const builder = (yargs: any) => epilogue(yargs)
  .positional('name', {
    demandOption: true,
    description: 'The name of the new schema',
    type: 'string',
  })
  .options({
    path: {
      description: 'The path to the folder where the schema should be created',
      type: 'string',
      default: './schemas',
    },
  });

export const handler = async function init({ name, path }: { name: string; path: string; }) {
  await schemaService.init(name, path);
};
