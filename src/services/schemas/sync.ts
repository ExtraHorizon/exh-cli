import * as path from 'path';
import * as chalk from 'chalk';
import { flatListFiles } from './util/listFilesInDir';
import { readJsonFile } from './util/readJson';
import { SyncSchema } from './util/syncSchema';
import { verify } from './verify';

export async function sync(file?: string, dir?: string, dry?: boolean, ignoreVerificationErrors?: boolean) {
  if (!file && !dir) {
    console.log(chalk.red('No target is chosen to be synced. Please use flags "--file" or "--dir" when syncing'));
    process.exit(1);
  }
  if (dir) {
    await syncTargetDir(path.resolve(dir || '.'), dry, ignoreVerificationErrors);
  }
  if (file) {
    await syncTargetFile(path.resolve(file), dry, ignoreVerificationErrors);
  }
}

export async function syncTargetFile(targetFile: string, dry?: boolean, ignoreVerificationErrors?: boolean) {
  await verify(targetFile, null, ignoreVerificationErrors);

  const filePath = path.resolve(targetFile);

  if (!filePath.endsWith('.json')) {
    console.log(`Ignored ${path.basename(filePath)}, not a JSON file (needs .json extension)`);
  } else {
    console.log(chalk.bold(`Synchronizing ${path.basename(filePath)}`));

    // parse to object
    const targetSchema = await readJsonFile(filePath);

    // synchronize with data service
    const syncSchema = SyncSchema.createSchemaSync(dry);
    await syncSchema.sync(targetSchema);
  }
}

/**
 * synchronizes all target schemas at the specified directory
 * @param {string} targetDir path to the directory containing all of the target schemas
 * @param {boolean} dry when set, a dry-run of the sync will be performed, this will log the changes without persistence of the new schema
 * @param {boolean} ignoreVerificationErrors when set, the verification of the schema will be skipped
 */
export async function syncTargetDir(targetDir: string, dry?: boolean, ignoreVerificationErrors?: boolean) {
  // list all the target files inside of the directory
  const targetFiles = flatListFiles(targetDir, '.json');

  // iterate through array of target files
  for (const filePath of targetFiles) {
    await syncTargetFile(filePath, dry, ignoreVerificationErrors);
    process.stdout.write('\n');
  }
}
