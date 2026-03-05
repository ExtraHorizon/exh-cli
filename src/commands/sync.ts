import * as fs from 'fs/promises';
import * as ospath from 'path';
import { REPO_CONFIG_FILE } from '../helpers/repoConfig';
import { epilogue } from '../helpers/util';
import * as syncService from '../services/sync';

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
    settings: {
      demandOption: false,
      describe: 'Sync service settings only',
      type: 'boolean',
      default: false,
    },
    ignoreSchemaVerificationErrors: {
      demandOption: false,
      describe: 'Allow schema synchronization to proceed with validation errors.',
      type: 'boolean',
      default: false,
    },
  })
  .check(async ({ path }) => {
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

export const handler = async (options: {
  path?: string;
  schemas?: boolean;
  tasks?: boolean;
  templates?: boolean;
  dispatchers?: boolean;
  cleanDispatchers?: boolean;
  localizations?: boolean;
  settings?: boolean;
  ignoreSchemaVerificationErrors?: boolean;
}) => {
  await syncService.sync(options);
};
