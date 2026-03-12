import { epilogue } from '../../helpers/util';
import * as templateService from '../../services/templates';

export const command = 'init <name>';
export const desc = 'Create a basic Template';

export const builder = (yargs: any) => epilogue(yargs)
  .positional('name', {
    demandOption: true,
    description: 'The name of the new template',
    type: 'string',
  })
  .options({
    path: {
      description: 'The path to the folder where the template should be created',
      type: 'string',
      default: './templates',
    },
  });

export const handler = async function init({ name, path }: { name: string; path: string; }) {
  await templateService.init(name, path);
};
