import { readdirSync } from 'fs';
import * as ospath from 'path';
import { Localization } from '@extrahorizon/javascript-sdk';
import { readJsonFileSync } from '../../../helpers/util';
import { assertValidLanguageCode } from './assertValidLanguageCode';

export interface LocalizationFilesOutput {
  localizations: Pick<Localization, 'key' | 'text'>[];
  languageCodes: string[];
}

/**
 * Used to build a map object to easily compare and sync the differences between the localizations service et the folder.
 * @param path The folder path where the localization files are located
 * @param keys The keys to filter on.
 * @param languages The languages to filter on.
 * @returns A map with the selected keys/languages/texts and the found language codes.
 */
export const readLocalizationFiles = (
  path: string,
  keys?: string[],
  languageCodes?: string[]
): LocalizationFilesOutput => {
  const uniqueLanguageCodes = new Set<string>();
  const localizationMap: Record<string, Pick<Localization, 'key' | 'text'>> = {};
  const fileNames = readdirSync(path);

  for (const fileName of fileNames) {
    const parsedFileName = ospath.parse(fileName);
    const languageCode = parsedFileName.name.toUpperCase();

    assertValidLanguageCode(languageCode);

    // Only process the .json files!
    if (parsedFileName.ext !== '.json') {
      continue;
    }

    // The language is not in the white list.
    if (languageCodes && !languageCodes.includes(languageCode)) {
      continue;
    }

    uniqueLanguageCodes.add(languageCode);

    const localizationJson = readJsonFileSync<Record<string, string>>(ospath.join(path, fileName));

    for (const [key, text] of Object.entries(localizationJson)) {
      // The key is not in the white list.
      if (keys && !keys.includes(key)) {
        continue;
      }

      if (!(key in localizationMap)) {
        localizationMap[key] = { key, text: {} };
      }

      localizationMap[key].text[languageCode] = text;
    }
  }

  return {
    localizations: Object.values(localizationMap),
    languageCodes: [...uniqueLanguageCodes.values()],
  };
};
