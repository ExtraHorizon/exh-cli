import { existsSync } from 'fs';
import * as ospath from 'path';
import * as chalk from 'chalk';
import { getRepoConfig } from '../helpers/repoConfig';
import * as dispatcherService from '../services/dispatchers';
import * as localizationService from '../services/localizations';
import * as schemaService from '../services/schemas';
import * as settingsService from '../services/settings';
import * as taskService from '../services/tasks';
import * as templateService from '../services/templates';

export async function sync({
  path,
  schemas,
  tasks,
  templates,
  dispatchers,
  cleanDispatchers,
  localizations,
  settings,
  ignoreSchemaVerificationErrors,
}: {
  path?: string;
  schemas?: boolean;
  tasks?: boolean;
  templates?: boolean;
  dispatchers?: boolean;
  cleanDispatchers?: boolean;
  localizations?: boolean;
  settings?: boolean;
  ignoreSchemaVerificationErrors?: boolean;
}) {
  const targetPath = path || '.';

  const cfg = await getRepoConfig(targetPath);

  const syncAll = !(schemas || tasks || templates || dispatchers || localizations || settings);

  /* Sync all schemas */
  if ((syncAll || schemas) && cfg.schemas) {
    console.log(chalk.green('\n ⚙️  Syncing schemas ...'));
    for (const schema of cfg.schemas) {
      await schemaService.sync(undefined, ospath.join(targetPath, schema), false, ignoreSchemaVerificationErrors);
    }
  }

  /* Sync all templates */
  if ((syncAll || templates) && cfg.templates) {
    console.log(chalk.green('\n ⚙️  Syncing templates...'));
    for (const template of cfg.templates) {
      await templateService.sync(ospath.join(targetPath, template));
    }
  }

  /* Sync all tasks */
  if ((syncAll || tasks) && cfg.tasks) {
    console.log(chalk.green('\n ⚙️  Syncing tasks...'));
    for (const task of cfg.tasks) {
      await taskService.sync({ path: ospath.join(targetPath, task) });
    }
  }

  /* Sync all localizations */
  if ((syncAll || localizations) && cfg.localizations) {
    console.log(chalk.green('\n ⚙️  Syncing localizations...'));
    for (const localization of cfg.localizations) {
      await localizationService.sync(ospath.join(targetPath, localization));
    }
  }

  /* Sync all dispatchers */
  if ((syncAll || dispatchers)) {
    // The dispatchers.json file is expected to be always in the root folder of the execution directory or of the provided path
    const dispatchersPath = ospath.join(targetPath, 'dispatchers.json');
    const isValidPath = existsSync(dispatchersPath);

    // Simulate a similar behavior as the `cfg = getRepoConfig(..)` does for the other configurations
    // Only mention a warning if the user explicitly wanted to sync dispatchers
    if (isValidPath) {
      console.log(chalk.green('\n ⚙️  Syncing dispatchers...'));

      await dispatcherService.sync(dispatchersPath, cleanDispatchers);
    } else if (dispatchers) {
      console.log(chalk.yellow('Warning: dispatchers.json not found'));
    }
  }

  if (syncAll || settings) {
    // The service-settings.json file is expected to be always in the root folder of the execution directory or of the provided path
    const serviceSettingsPath = ospath.join(targetPath, 'service-settings.json');
    const isValidPath = existsSync(serviceSettingsPath);

    // Simulate a similar behavior as the `cfg = getRepoConfig(..)` does for the other configurations
    // Only mention a warning if the user explicitly wanted to sync dispatchers
    if (isValidPath) {
      console.log(chalk.green('\n ⚙️  Syncing service settings...'));

      await settingsService.sync(serviceSettingsPath);
    } else if (settings) {
      console.log(chalk.yellow('Warning: service-settings.json not found'));
    }
  }
}
