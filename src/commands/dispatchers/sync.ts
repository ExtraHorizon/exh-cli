import { Argv } from 'yargs';
import { epilogue } from '../../helpers/util';
import * as dispatchersService from '../../services/dispatcherService';

export const command = 'sync';
export const desc = 'Synchronize Dispatchers, if a declared Dispatcher does not exist, it will be created';
export const builder = (yargs: Argv) => epilogue(yargs).options({
  file: {
    demandOption: true,
    describe: 'Path to the file containing Dispatcher(s) configuration',
    type: 'string',
  },
});

export const handler = async ({ sdk, file }) => {
  await dispatchersService.sync(sdk, file);
};
