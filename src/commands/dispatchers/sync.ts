import { OAuth1Client } from '@extrahorizon/javascript-sdk';
import { Argv } from 'yargs';
import { epilogue } from '../../helpers/util';
import * as dispatchersService from '../../services/dispatchers';

export const command = 'sync';
export const desc = 'Synchronize Dispatchers, if a declared Dispatcher does not exist, it will be created';
export const builder = (yargs: Argv) => epilogue(yargs).options({
  file: {
    demandOption: true,
    describe: 'Path to the file containing the Dispatcher(s) configuration',
    type: 'string',
  },
});

export const handler = async ({ sdk, file }: {sdk: OAuth1Client; file: string;}) => {
  await dispatchersService.sync(sdk, file);
};
