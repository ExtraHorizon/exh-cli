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
});

export const handler = async ({ sdk, dir, file, dry }) => {
  if (!file && !dir) {
    console.log(chalk.red('No target is chosen to be synced. Please use flags "--file" or "--dir" when syncing'));
    process.exit(1);
  }
  if (dir) {
    const targetDir = path.resolve(dir || '.');
    await verifyHandler({ dir: targetDir, file: null });
    await syncTargetDir(sdk, targetDir, dry);
  }
  if (file) {
    const targetFile = path.resolve(file);
    await verifyHandler({ dir: null, file: targetFile });
    await syncTargetFile(sdk, targetFile, dry);
  }
};

export async function syncTargetFile(sdk: any, targetFile: string, dry?: boolean) {
  const filePath = path.resolve(targetFile);

  if (!filePath.endsWith('.json')) {
    console.log(`Ignored ${path.basename(filePath)}, not a JSON file (needs .json extension)`);
  } else {
    console.group(chalk.bold(`Synchronizing ${path.basename(filePath)}`));

    // parse to object
    const targetSchema = await readJsonFile(filePath);

    // synchronize with data service
    const syncSchema = SyncSchema.createSchemaSync(sdk, dry);
    await syncSchema.sync(targetSchema);
    console.groupEnd();
  }
}

/**
 * synchronizes all target schemas at the specified directory
 * @param {string} targetDir path to the directory containing all of the target schemas
 */
export async function syncTargetDir(sdk: any, targetDir: string, dry?: boolean) {
  // list all the target files inside of the directory
  const targetFiles = flatListFiles(targetDir, '.json');

  // iterate through array of target files
  for (const filePath of targetFiles) {
    await syncTargetFile(sdk, filePath, dry);
    process.stdout.write('\n');
  }
}
