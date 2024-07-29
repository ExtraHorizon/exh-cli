import { readdirSync, readFileSync } from 'fs';
import * as osPath from 'path';
import { PartialLocalization } from '../../repositories/localizations';
import { assertValidFileContent } from './assertValidFileContent';
import { assertValidLanguageCode } from './assertValidLanguageCode';

/**
 * Read all localization files from a directory and transform them into an array of localizations
 */
export function readFiles(path: string) {
  let fileNames: string[];
  try {
    fileNames = readdirSync(path);
  } catch (error) {
    throw new Error(`Was not able to list localization files in directory '${path}': ${error}`);
  }

  const localizationMap: Record<string, PartialLocalization> = {};
  for (const fileName of fileNames) {
    const parsedFileName = osPath.parse(fileName);

    // Only process the .json files!
    if (parsedFileName.ext !== '.json') {
      continue;
    }

    const languageCode = parsedFileName.name.toUpperCase();
    assertValidLanguageCode(languageCode);

    const localizationJson = readLocalizationFileSync(path, fileName);
    assertValidFileContent(fileName, localizationJson);

    for (const [key, text] of Object.entries(localizationJson)) {
      if (!(key in localizationMap)) {
        localizationMap[key] = { key, text: {} };
      }

      localizationMap[key].text[languageCode] = text;
    }
  }

  return Object.values(localizationMap);
}

function readLocalizationFileSync(path: string, fileName: string) {
  const fileContent = readFileSync(osPath.join(path, fileName), { encoding: 'utf-8' });

  try {
    return JSON.parse(fileContent);
  } catch (error) {
    throw Error(`Was not able to parse '${fileName}', not a valid JSON file`);
  }
}
