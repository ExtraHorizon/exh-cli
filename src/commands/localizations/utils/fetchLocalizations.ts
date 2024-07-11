import { Localization, OAuth1Client, rqlBuilder } from '@extrahorizon/javascript-sdk';
import { chunk } from 'lodash';

/**
 * @param sdk The Exh SDK to communicate with the backend services.
 * @param keys The keys to fetch.
 * @param languageCodes The filtered language codes to select.
 */
export const fetchLocalizations = async (
  sdk: OAuth1Client,
  keys: string[],
  languageCodes: string[]
): Promise<Localization[]> => {
  const localizations: Localization[] = [];

  // To avoid having an issue with the rql being too long for the URL length limitation. The keys are fetched by 5.
  const keyChunks = chunk(keys, 5);

  for (const keyChunk of keyChunks) {
    const result = await sdk.localizations.find({
      rql: rqlBuilder()
        .in('key', keyChunk)
        .select(['key'].concat(languageCodes.map(languageCode => `text.${languageCode}`)))
        .build(),
    });

    localizations.push(...result.data);
  }

  return localizations;
};
