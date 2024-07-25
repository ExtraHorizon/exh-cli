import * as fs from 'fs';
import * as ospath from 'path';
import { OAuth1Client } from '@extrahorizon/javascript-sdk';
import { epilogue } from '../../helpers/util';
import { readLocalizationFiles } from './utils/readLocalizationFiles';
import { syncLocalizations } from './utils/syncLocalizations';

export const command = 'sync';
export const desc = 'Sync all localizations in a directory with the ExH cloud';
export const builder = (yargs: any) => epilogue(yargs).options({
  path: {
    demandOption: false,
    describe: 'Directory containing the localizations which need to be synced in a JSON format. By Default: ./localizations',
    type: 'string',
  },
}).check(({ path }) => {
  if (path && !fs.existsSync(ospath.join(process.cwd(), path))) {
    throw new Error('please provide a valid file path for your localizations');
  }

  return true;
});

export const handler = async ({ sdk, path }: { sdk: OAuth1Client; path?: string; }) => {
  const fullPath = ospath.join(process.cwd(), path ?? 'localizations');

  console.log(`- Reading the localization configuration from ${fullPath}`);
  const localizations = readLocalizationFiles(fullPath);

  await syncLocalizations(sdk, localizations);
};
