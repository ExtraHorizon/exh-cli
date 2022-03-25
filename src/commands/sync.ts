import * as ospath from 'path';
import * as fs from 'fs/promises';
import { DEFAULT_REPO_CONFIG } from '../constants';
import { epilogue } from '../helpers/util';
import { syncTargetDir as syncSchemas } from './data/schemas/sync';
import { syncTargetDir as syncTemplates } from './templates/sync';
import { handler as syncTask } from './tasks/sync';

export const command = 'sync';
export const desc = 'Upload all schemas, templates & tasks to the cloud environment';
export const builder = (yargs: any) => epilogue(yargs)
  .options({
    config: {
      demandOption: false,
      describe: 'Location of configuration file',
      type: 'string',
      default: './repo-config.json',
    },
  }).check(async ({ config }) => {
    try {
      await fs.access(ospath.join(process.cwd(), config));
    } catch (err) {
      throw new Error(`Repository config file ${config} does not exist`);
    }
    if (!(await fs.stat(ospath.join(process.cwd(), config))).isFile()) {
      throw new Error('please provide a valid repository config file');
    }
    return true;
  });

function validateRepoConfig(config: any): boolean {
  if (config.schemas && !Array.isArray(config.schemas)) {
    throw new Error('Error in repo config file: \'schemas\' is not an array');
  }
  if (config.templates && !Array.isArray(config.templates)) {
    throw new Error('Error in repo config file: \'templates\' is not an array');
  }

  return true;
}

export const handler = async ({ sdk, config }) => {
  let cfg = DEFAULT_REPO_CONFIG;
  /* Process config file */
  try {
    cfg = JSON.parse((await fs.readFile(config)).toString());
  } catch (err) { /* */ }

  validateRepoConfig(cfg);

  /* Sync all schemas */
  if (cfg.schemas) {
    for (const schema of cfg.schemas) {
      await syncSchemas(sdk, schema);
    }
  }
  /* Sync all templates */
  if (cfg.templates) {
    for (const template of cfg.templates) {
      await syncTemplates(sdk, template);
    }
  }

  /* Sync all tasks */
  if (cfg.tasks) {
    for (const task of cfg.tasks) {
      await syncTask({ sdk, config: task });
    }
  }
};
