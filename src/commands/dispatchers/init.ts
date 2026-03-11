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
    file: {
      description: 'Path to the file containing the Dispatcher(s) configuration',
      type: 'string',
      default: './dispatchers.json',
    },
  });

export const handler = async function init({ name, file }: { name: string; file: string; }) {
  await dispatcherService.init(name, file);
};
