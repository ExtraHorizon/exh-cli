import { OAuth1Client } from '@extrahorizon/javascript-sdk';
import { epilogue } from '../../helpers/util';
import * as localizationsService from '../../services/localizations';

export const command = 'sync';
export const desc = 'Sync all localizations in a directory with the ExH cloud';
export const builder = (yargs: any) => epilogue(yargs).options({
  path: {
    demandOption: false,
    describe: 'Directory containing the localizations which need to be synced in a JSON format. By Default: ./localizations',
    type: 'string',
    default: './localizations',
  },
});

export const handler = async ({ sdk, path }: { sdk: OAuth1Client; path?: string; }) => {
  await localizationsService.sync(sdk, path);
};
