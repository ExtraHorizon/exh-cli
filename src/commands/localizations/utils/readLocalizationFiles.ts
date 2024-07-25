import { readdirSync } from 'fs';
import * as ospath from 'path';
import { readJsonFileSync } from '../../../helpers/util';
import { PartialLocalization } from '../../../repositories/localizations';
import { assertValidLanguageCode } from './assertValidLanguageCode';

/**
 * Used to build a map object to easily compare and sync the differences between the localizations service et the folder.
 */
export const readLocalizationFiles = (path: string) => {
  const localizationMap: Record<string, PartialLocalization> = {};
  const fileNames = readdirSync(path);

  for (const fileName of fileNames) {
    const parsedFileName = ospath.parse(fileName);

    // Only process the .json files!
    if (parsedFileName.ext !== '.json') {
      continue;
    }

    const languageCode = parsedFileName.name.toUpperCase();
    assertValidLanguageCode(languageCode);

    const localizationJson = readJsonFileSync<Record<string, string>>(ospath.join(path, fileName));

    // TODO: validation of the file structure?
    // Use 'assertValidKey(...)' ?

    for (const [key, text] of Object.entries(localizationJson)) {
      if (!(key in localizationMap)) {
        localizationMap[key] = { key, text: {} };
      }

      localizationMap[key].text[languageCode] = text;
    }
  }

  return Object.values(localizationMap);
};
