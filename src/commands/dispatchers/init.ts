import { epilogue } from '../../helpers/util';
import * as dispatcherService from '../../services/dispatchers';

export const command = 'init <name>';
export const desc = 'Create a basic Dispatcher';

export const builder = (yargs: any) => epilogue(yargs)
  .positional('name', {
    demandOption: true,
    description: 'The name of the new Dispatcher',
    type: 'string',
  })
  .options({
    path: {
      description: 'The path to the folder where the Dispatchers file should be created',
      type: 'string',
      default: './',
    },
  });

export const handler = async function init({ name, path }: { name: string; path: string; }) {
  await dispatcherService.init(name, path);
};
