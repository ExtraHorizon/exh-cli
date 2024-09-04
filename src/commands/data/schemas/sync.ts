import * as path from 'path';
import * as chalk from 'chalk';
import { epilogue } from '../../../helpers/util';
import { flatListFiles } from './util/listFilesInDir';
import { readJsonFile } from './util/readJson';
import { SyncSchema } from './util/syncSchema';
import { handler as verifyHandler } from './verify';

export const command = 'sync';
export const desc = 'Sync all schemas in a directory with the ExH cloud';
export const builder = (yargs: any) => epilogue(yargs).options({
  dir: {
    demandOption: false,
    describe: 'Directory containing the schemas which need to be synced',
    type: 'string',
  },
  file: {
    demandOption: false,
    describe: 'File containing a schema which needs to be synced',
    type: 'string',
  },
  dry: {
    demandOption: false,
    describe: 'When set, a dry-run will be performed. Only output will be printed, but no changes will be pushed to the back-end.',
    type: 'boolean',
  },
  ignoreVerificationErrors: {
    demandOption: false,
    describe: 'Allow synchronization to proceed with validation errors.',
    type: 'boolean',
    default: false,
  },
});

export const handler = async ({ sdk, dir, file, dry, ignoreVerificationErrors }) => {
  if (!file && !dir) {
    console.log(chalk.red('No target is chosen to be synced. Please use flags "--file" or "--dir" when syncing'));
    process.exit(1);
  }
  if (dir) {
    await syncTargetDir(sdk, path.resolve(dir || '.'), dry, ignoreVerificationErrors);
  }
  if (file) {
    await syncTargetFile(sdk, path.resolve(file), dry, ignoreVerificationErrors);
  }
};

export async function syncTargetFile(sdk: any, targetFile: string, dry?: boolean, ignoreVerificationErrors?: boolean) {
  await verifyHandler({ dir: null, file: targetFile, ignoreVerificationErrors });

  const filePath = path.resolve(targetFile);

  if (!filePath.endsWith('.json')) {
    console.log(`Ignored ${path.basename(filePath)}, not a JSON file (needs .json extension)`);
  } else {
    console.log(chalk.bold(`Synchronizing ${path.basename(filePath)}`));

    // parse to object
    const targetSchema = await readJsonFile(filePath);

    // synchronize with data service
    const syncSchema = SyncSchema.createSchemaSync(sdk, dry);
    await syncSchema.sync(targetSchema);
  }
}

/**
 * synchronizes all target schemas at the specified directory
 * @param {string} targetDir path to the directory containing all of the target schemas
 * @param {boolean} dry when set, a dry-run of the sync will be performed, this will log the changes without persistence of the new schema
 * @param {boolean} ignoreVerificationErrors when set, the verification of the schema will be skipped
 */
export async function syncTargetDir(sdk: any, targetDir: string, dry?: boolean, ignoreVerificationErrors?: boolean) {
  // list all the target files inside of the directory
  const targetFiles = flatListFiles(targetDir, '.json');

  // iterate through array of target files
  for (const filePath of targetFiles) {
    await syncTargetFile(sdk, filePath, dry, ignoreVerificationErrors);
    process.stdout.write('\n');
  }
}
