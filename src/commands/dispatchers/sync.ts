import { Argv } from 'yargs';
import { epilogue } from '../../helpers/util';
import * as dispatchersService from '../../services/dispatchers';

export const command = 'sync';
export const desc = 'Synchronize Dispatchers, if a declared Dispatcher does not exist, it will be created';
export const builder = (yargs: Argv) => epilogue(yargs).options({
  file: {
    demandOption: false,
    describe: 'Path to the file containing the Dispatcher(s) configuration',
    type: 'string',
    default: './dispatchers.json',
  },
  clean: {
    demandOption: false,
    describe: 'Delete Dispatchers created using the CLI, that are no longer present in the local Dispatcher file',
    type: 'boolean',
  },
});

export const handler = async ({ file, clean }: { file: string; clean: boolean; }) => {
  await dispatchersService.sync(file, clean);
};
