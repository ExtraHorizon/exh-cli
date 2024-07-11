import { Localization, OAuth1Client } from '@extrahorizon/javascript-sdk';
import chalk = require('chalk');

const getMissingLocalizations = (
  configLocalizations: Pick<Localization, 'key' | 'text'>[],
  fetchedLocalizations: Localization[]
): Pick<Localization, 'key' | 'text'>[] => configLocalizations.filter(
  configLocalization => fetchedLocalizations.find(
    fetchedLocalization => fetchedLocalization.key === configLocalization.key
  ) === undefined
);

const getChangedLocalizations = (
  configLocalizations: Pick<Localization, 'key' | 'text'>[],
  fetchedLocalizations: Localization[]
): Pick<Localization, 'key' | 'text'>[] => {
  const changedLocalizations: Pick<Localization, 'key' | 'text'>[] = [];

  for (const configLocalization of configLocalizations) {
    const knownLocalization = fetchedLocalizations.find(fetchedLocalization => fetchedLocalization.key === configLocalization.key);

    // Only check for a potential update if the localization is found.
    if (knownLocalization) {
      const localizationUpdateData: Pick<Localization, 'key' | 'text'> = {
        key: configLocalization.key,
        text: {},
      };

      for (const [newLanguage, newText] of Object.entries(configLocalization.text)) {
        const knownText = knownLocalization.text[newLanguage];
        if (!knownText || knownText !== newText) {
          localizationUpdateData.text[newLanguage] = newText;
        }
      }

      // If no text was changed, nothing to update!
      if (Object.keys(localizationUpdateData.text).length > 0) {
        changedLocalizations.push(localizationUpdateData);
      }
    }
  }

  return changedLocalizations;
};

/**
 * Update or/and create the localizations by comparing the configured ones and the fetched ones.
 * @param sdk The ExH sdk client.
 * @param configLocalizations The localizations known by the configuration.
 * @param fetchedLocalizations The localizations from localizations service.
 */
export const syncLocalizations = async (
  sdk: OAuth1Client,
  configLocalizations: Pick<Localization, 'key' | 'text'>[],
  fetchedLocalizations: Localization[]
) => {
  const localizationsToCreate = getMissingLocalizations(configLocalizations, fetchedLocalizations);
  const localizationsToUpdate = getChangedLocalizations(configLocalizations, fetchedLocalizations);

  console.log(`- Creating of ${localizationsToCreate.length} new localization key(s).`);
  if (localizationsToCreate.length > 0) {
    await sdk.localizations.create({
      localizations: localizationsToCreate,
    });
    console.log(chalk.green('Successful!'));
  }

  console.log(`- Updating of ${localizationsToUpdate.length} new localization key(s).`);
  if (localizationsToUpdate.length > 0) {
    await sdk.localizations.update({
      localizations: localizationsToUpdate,
    });
    console.log(chalk.green('Successful!'));
  }
};
