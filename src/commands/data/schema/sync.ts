import * as path from 'path';
import { flatListFiles } from './util/listFilesInDir';
import { readJsonFile } from './util/readJson';
import { SyncSchema } from './util/syncSchema';
import { epilogue } from '../../../helpers/util';

export const command = 'sync';
export const desc = 'sync all schemas in a directory with the ExH cloud';
export const builder = (yargs: any) => epilogue(yargs).options({
  target: {
    demandOption: true,
    describe: 'Directory containing the schemas which need to be synced',
    type: 'string',
  },
});

export const handler = async ({ sdk, target }) => {
  await syncTargetDir(sdk, path.resolve(target || '.'));
};

/**
 * synchronizes all target schemas at the specified directory
 * @param {string} targetDir path to the directory containing all of the target schemas
 */
export async function syncTargetDir(sdk: any, targetDir: string) {
  // list all the target files inside of the directory
  const targetFiles = await flatListFiles(targetDir);

  const syncSchema = SyncSchema.createSchemaSync(sdk);

  // iterate through array of target files
  for (const filePath of targetFiles) {
    // safety check, ignore non-JSON files
    if (!filePath.endsWith('.json')) {
      console.log(`Ignored ${path.basename(filePath)}, not a JSON file (needs .json extension)`);
      continue;
    }

    console.log(`Synchronizing ${path.basename(filePath)}`);

    // parse to object
    const targetSchema = await readJsonFile(filePath);

    // synchronize with data service
    await syncSchema.sync(targetSchema);
    process.stdout.write('\n');
  }
}
