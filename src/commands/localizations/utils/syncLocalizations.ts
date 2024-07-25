import { Localization, OAuth1Client } from '@extrahorizon/javascript-sdk';
import chalk = require('chalk');
import * as localizationRepository from '../../../repositories/localizations';
import { PartialLocalization } from '../../../repositories/localizations';

/**
 * Update or/and create localizations
 */
export const syncLocalizations = async (sdk: OAuth1Client, localizations: PartialLocalization[]) => {
  console.log(`Syncing ${localizations.length} localization key(s).`);

  // TODO: chunk?

  const creationResult = await localizationRepository.create(sdk, localizations);
  // TODO: can creationResult.created be undefined?
  console.log(`Created ${creationResult.created} localization(s).`);

  if (creationResult.existingIds && creationResult.existingIds.length > 0) {
    const existingLocalizations = filterLocalizationsByKeys(localizations, creationResult.existingIds);

    const updateResult = await localizationRepository.update(sdk, existingLocalizations);
    // TODO: can creationResult.updated be undefined?
    console.log(`Updated ${updateResult.updated} localization(s).`);
  }

  console.log(chalk.green('Successful!'));
};

function filterLocalizationsByKeys(localizations: Localization[], keys: string[]) {
  return localizations.filter(localization => keys.includes(localization.key));
}
