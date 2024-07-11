import * as fs from 'fs';
import * as ospath from 'path';
import { OAuth1Client } from '@extrahorizon/javascript-sdk';
import { epilogue } from '../../helpers/util';
import { assertValidKey } from './utils/assertValidKey';
import { assertValidLanguageCode } from './utils/assertValidLanguageCode';
import { fetchLocalizations } from './utils/fetchLocalizations';
import { readLocalizationFiles } from './utils/readLocalizationFiles';
import { syncLocalizations } from './utils/syncLocalizations';

export const command = 'sync';
export const desc = 'Sync all localizations in a directory with the ExH cloud';
export const builder = (yargs: any) => epilogue(yargs).options({
  path: {
    demandOption: false,
    describe: 'Directory containing the localizations which need to be synced in a JSON format. By Default: /locales',
    type: 'string',
  },
  keys: {
    demandOption: false,
    describe: 'The keys separated by a "," to sync',
    type: 'string',
  },
  languages: {
    demandOption: false,
    describe: 'The languages separated by a "," to sync',
    type: 'string',
  },
}).check(({ path, keys: rawKeys, languages: rawLanguages }) => {
  if (path && !fs.existsSync(ospath.join(process.cwd(), path))) {
    throw new Error('please provide a valid file path for your localizations');
  }

  if (rawLanguages) {
    const languageCodes = rawLanguages.toLocaleUpperCase().split(',');

    for (const languageCode of languageCodes) {
      assertValidLanguageCode(languageCode);
    }
  }

  if (rawKeys) {
    const keys = rawKeys.split(',');

    for (const key of keys) {
      assertValidKey(key);
    }
  }

  return true;
});

interface HandlerInput {
  sdk: OAuth1Client;
  path?: string;
  languages?: string;
  keys?: string;
}

export const handler = async ({ keys: rawKeys, languages: rawLanguages, path, sdk }: HandlerInput) => {
  const keys = rawKeys?.split(',');
  const selectedLanguageCodes = rawLanguages?.toUpperCase().split(',');
  const fullPath = ospath.join(process.cwd(), path ?? 'locales');

  console.log(`- Reading the localization configuration from ${fullPath}`);
  const { localizations, languageCodes } = readLocalizationFiles(fullPath, keys, selectedLanguageCodes);

  console.log('- Fetching the localization configuration from the localizations service');
  const savedLocalizations = await fetchLocalizations(sdk, localizations.map(localization => localization.key), languageCodes);

  await syncLocalizations(sdk, localizations, savedLocalizations);
};
