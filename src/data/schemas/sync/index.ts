import * as path from 'path';
import { flatListFiles } from './listFilesInDir';
import { readJsonFile } from './readJson';
import { syncSchema } from './syncSchema';
/**
 * synchronizes all target schemas at the specified directory
 * @param {string} targetDir path to the directory containing all of the target schemas
 */
export async function syncTargetDir(targetDir) {
    // list all the target files inside of the directory
    const targetFiles = await flatListFiles(targetDir);

    // iterate through array of target files
    for (const filePath of targetFiles) {

        // safety check, ignore non-JSON files
        if (!filePath.endsWith('.json')) {
            console.log(`ignored ${path.basename(filePath)}, not JSON`);
            continue;
        }

        console.log(`synchronizing ${path.basename(filePath)}`);

        // parse to object
        const targetSchema = await readJsonFile(filePath);

        // synchronize with data service
        try{
            await syncSchema(targetSchema);
            process.stdout.write('\n');
        } catch (err) {
            throw err;
        }
        
    }

}