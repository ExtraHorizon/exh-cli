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
    demandOption: true,
    describe: 'Directory containing the schemas which need to be synced',
    type: 'string',
  },
});

export const handler = async ({ sdk, dir }) => {
  await syncTargetDir(sdk, path.resolve(dir || '.'));
};

/**
 * synchronizes all target schemas at the specified directory
 * @param {string} targetDir path to the directory containing all of the target schemas
 */
export async function syncTargetDir(sdk: any, targetDir: string) {
  /* Do a verification of the schema before syncing it */
  await verifyHandler({ dir: targetDir, file: null });

  // list all the target files inside of the directory
  const targetFiles = await flatListFiles(targetDir, '.json');

  const syncSchema = SyncSchema.createSchemaSync(sdk);

  // iterate through array of target files
  for (const filePath of targetFiles) {
    // safety check, ignore non-JSON files
    if (!filePath.endsWith('.json')) {
      console.log(`Ignored ${path.basename(filePath)}, not a JSON file (needs .json extension)`);
      continue;
    }

    console.log(chalk.bold(`Synchronizing ${path.basename(filePath)}`));

    // parse to object
    const targetSchema = await readJsonFile(filePath);

    // synchronize with data service
    await syncSchema.sync(targetSchema);
    process.stdout.write('\n');
  }
}
