import { OAuth1Client } from '@extrahorizon/javascript-sdk';
import * as chalk from 'chalk';
import { chunk } from 'lodash';
import * as localizationRepository from '../../repositories/localizations';
import { PartialLocalization } from '../../repositories/localizations';

const chunkSize = 30;

/**
 * Update or/and create localizations
 */
export const syncLocalizations = async (sdk: OAuth1Client, localizations: PartialLocalization[]) => {
  console.log(`${localizations.length} localization(s) to synchronize.`);

  const localizationChunks = chunk(localizations, chunkSize);

  for (const localizationChunk of localizationChunks) {
    const creationResult = await localizationRepository.create(sdk, localizationChunk);
    console.log(`Created ${creationResult.created} localization(s).`);

    if (creationResult.existingIds && creationResult.existingIds.length > 0) {
      const existingKeys = creationResult.existingIds;
      const existingLocalizations = localizationChunk.filter(localization => existingKeys.includes(localization.key));

      const updateResult = await localizationRepository.update(sdk, existingLocalizations);
      console.log(`Updated ${updateResult.updated} localization(s).`);
    }
  }

  console.log(chalk.green('Successful!'));
};
