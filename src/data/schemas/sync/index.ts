import * as path from 'path';
import { flatListFiles } from './listFilesInDir';
import { readJsonFile } from './readJson';
import { syncSchema } from './syncSchema';

const help = `
Usage: exh data schemas sync <targetDir>

Options
  -h,--help             Documentation

Please visit: https://docs.extrahorizon.com/extrahorizon-cli/ for more information.
`;

export default async function sync(arg:string[]){
    const command = arg[0];
    switch(command){
        case '-h': 
        case '--help':
        case undefined:
            console.log("\x1b[33m",help);
        break;
        default: await syncSchemas(arg); break;
    }
}

export async function syncSchemas(arg:string[]){
    const relativePath = arg[0]? arg[0] : '.';
    const targetSchemaDir = path.join(process.cwd(), relativePath);

    await syncTargetDir(targetSchemaDir);
}

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
        await syncSchema(targetSchema);
        process.stdout.write('\n');
    }

}