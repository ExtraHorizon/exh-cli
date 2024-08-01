import { existsSync } from 'fs';
import * as fs from 'fs/promises';
import * as ospath from 'path';
import { OAuth1Client } from '@extrahorizon/javascript-sdk';
import * as chalk from 'chalk';
import { getRepoConfig, REPO_CONFIG_FILE } from '../helpers/repoConfig';
import { epilogue } from '../helpers/util';
import { sync as syncDispatchers } from '../services/dispatchers';
import { sync } from '../services/localizations';
import { syncTargetDir as syncSchemas } from './data/schemas/sync';
import { handler as syncTask } from './tasks/sync';
import { handler as syncTemplates } from './templates/sync';

export const command = 'sync';
export const desc = 'Sync your ExH configuration to the cloud environment';
export const builder = (yargs: any) => epilogue(yargs)
  .options({
    path: {
      demandOption: false,
      describe: `Path to folder which needs to be synchronized. The target folder should contain a ${REPO_CONFIG_FILE} file. 
If not, the local directory is assumed with a default configuration which assumes tasks are in a 'tasks' folder, schemas in  a 'schemas' folder, etc...`,
      type: 'string',
    },
    schemas: {
      demandOption: false,
      describe: 'Sync schemas only',
      type: 'boolean',
      default: false,
    },
    tasks: {
      demandOption: false,
      describe: 'Sync tasks only',
      type: 'boolean',
      default: false,
    },
    templates: {
      demandOption: false,
      describe: 'Sync templates only',
      type: 'boolean',
      default: false,
    },
    dispatchers: {
      demandOption: false,
      describe: 'Sync Dispatchers only',
      type: 'boolean',
      default: false,
    },
    cleanDispatchers: {
      demandOption: false,
      describe: 'Delete Dispatchers created using the CLI, that are no longer present in the local Dispatcher file',
      type: 'boolean',
    },
    localizations: {
      demandOption: false,
      describe: 'Sync localizations only',
      type: 'boolean',
      default: false,
    },
    ignoreSchemaVerificationErrors: {
      demandOption: false,
      describe: 'Allow schema synchronization to proceed with validation errors.',
      type: 'boolean',
      default: false,
    },

  }).check(async ({ path }) => {
    if (path !== undefined) {
      try {
        await fs.access(ospath.join(process.cwd(), path, REPO_CONFIG_FILE));
      } catch (err) {
        throw new Error(`Repository config file not found at ${path}`);
      }
      if (!(await fs.stat(ospath.join(process.cwd(), path, REPO_CONFIG_FILE))).isFile()) {
        throw new Error('please provide a valid repository config file');
      }
    }
    return true;
  });

export const handler = async ({
  sdk, path, schemas, tasks, templates, dispatchers, cleanDispatchers, localizations, ignoreSchemaVerificationErrors,
}: {
  sdk: OAuth1Client;
  path?: string;
  schemas?: boolean;
  tasks?: boolean;
  templates?: boolean;
  dispatchers?: boolean;
  cleanDispatchers?: boolean;
  localizations?: boolean;
  ignoreSchemaVerificationErrors?: boolean;
}) => {
  const targetPath = path || '.';

  const cfg = await getRepoConfig(targetPath);

  const syncAll = !(schemas || tasks || templates || dispatchers || localizations);

  /* Sync all schemas */
  if ((syncAll || schemas) && cfg.schemas) {
    console.log(chalk.green('\n ⚙️  Syncing schemas ...'));
    for (const schema of cfg.schemas) {
      await syncSchemas(sdk, ospath.join(targetPath, schema), undefined, ignoreSchemaVerificationErrors);
    }
  }

  /* Sync all templates */
  if ((syncAll || templates) && cfg.templates) {
    console.log(chalk.green('\n ⚙️  Syncing templates...'));
    for (const template of cfg.templates) {
      await syncTemplates({ sdk, path: ospath.join(targetPath, template), template: null });
    }
  }

  /* Sync all tasks */
  if ((syncAll || tasks) && cfg.tasks) {
    console.log(chalk.green('\n ⚙️  Syncing tasks...'));
    for (const task of cfg.tasks) {
      await syncTask({ sdk, path: ospath.join(targetPath, task) });
    }
  }

  /* Sync all localizations */
  if ((syncAll || localizations) && cfg.localizations) {
    console.log(chalk.green('\n ⚙️  Syncing localizations...'));
    for (const localization of cfg.localizations) {
      await sync(sdk, ospath.join(targetPath, localization));
    }
  }

  /* Sync all dispatchers */
  if ((syncAll || dispatchers)) {
    // The dispatchers.json file is expected to be always in the root folder of the execution directory or of the provided path
    const dispatchersPath = ospath.join(targetPath, 'dispatchers.json');
    const isValidPath = existsSync(dispatchersPath);

    if (isValidPath) {
      await syncDispatchers(sdk, dispatchersPath, cleanDispatchers);
    } else {
      console.log(chalk.yellow('Warning: dispatchers.json not found'));
    }
  }
};
