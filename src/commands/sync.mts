import * as fs from 'fs/promises';
import * as ospath from 'path';
import chalk from 'chalk';
import { getRepoConfig, REPO_CONFIG_FILE } from '../helpers/repoConfig.mjs';
import { epilogue } from '../helpers/util.mjs';
import { syncTargetDir as syncSchemas } from './data/schemas/sync.mjs';
import { handler as syncTask } from './tasks/sync.mjs';
import { handler as syncTemplates } from './templates/sync.mjs';

export const command = 'sync';
export const desc = 'Upload all schemas, templates & tasks to the cloud environment';
export const builder = (yargs: any) => epilogue(yargs)
  .options({
    path: {
      demandOption: false,
      describe: `Path to folder which needs to be synchronized. The target folder should contain a ${REPO_CONFIG_FILE} file. 
If not, the local directory is assumed with a default configuration which assumes tasks are in a 'tasks' folder, schemas in  a 'schemas' folder and templates in a 'templates' folder`,
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

export const handler = async ({ sdk, path, schemas, tasks, templates }) => {
  const targetPath = ospath.join(process.cwd(), path || '.');
  const cfg = await getRepoConfig(targetPath, true);

  const syncAll = !(schemas || tasks || templates);

  /* Sync all schemas */
  if ((syncAll || schemas) && cfg.schemas) {
    console.log(chalk.green('\n ⚙️  Syncing schemas ...'));
    for (const schema of cfg.schemas) {
      await syncSchemas(sdk, ospath.join(targetPath, schema));
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
};
