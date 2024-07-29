import { OAuth1Client } from '@extrahorizon/javascript-sdk';
import { yellow } from 'chalk';
import { PartialLocalization } from '../../repositories/localizations';
import { readFiles } from './readFiles';
import { syncLocalizations } from './syncLocalizations';

export async function sync(sdk: OAuth1Client, path: string) {
  console.log(yellow(`Synchronizing localizations from ${path}`));
  const localizations = readFiles(path);

  if (localizations.length < 1) {
    console.log(yellow('No localizations found'));
    return;
  }

  assertDefaultLanguageSetForAll(localizations);

  await syncLocalizations(sdk, localizations);
}

function assertDefaultLanguageSetForAll(localizations: PartialLocalization[]) {
  const defaultLanguage = 'EN';
  const faultyLocalizations = localizations.filter(localization => localization.text[defaultLanguage] === undefined);
  const faultyKeys = faultyLocalizations.map(localization => localization.key);

  if (faultyKeys.length > 0) {
    throw new Error(`The following localizations do not have a value for the default language (${defaultLanguage}): ${faultyKeys.join(', ')}`);
  }
}
