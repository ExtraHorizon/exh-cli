import * as path from 'path';
import Ajv from 'ajv';
import * as chalk from 'chalk';
import * as metaschema from '../../config-json-schemas/Schema.json';
import { CommandError } from '../../helpers/error';
import { flatListFiles } from './util/listFilesInDir';
import { SchemaVerify } from './util/schemaverify';

export async function verify(file?: string, dir?: string, ignoreVerificationErrors?: boolean) {
  let files: string[] = [];

  if (dir) {
    files = await flatListFiles(dir, '.json');
  } else { /* enforced by check() */
    files = [file];
  }

  const checkFile = (schemaPath: string) => {
    let schema: any = {};
    console.log(chalk.bold('Checking', schemaPath));
    try {
      schema = require(path.resolve(schemaPath));
    } catch (err) {
      console.log(chalk.red(`Failed to load schema file ${file}. Possibly not a valid JSON file`));
      console.log(err);
      return;
    }

    /* Following checks are done on the schema
     * 1. Check if the schema complies to ExH data schema format ('config-json-schemas/Schema.json')
     * 2. Check if the properties object, if present, is valid JSON schema
     * 3. Check if the configuration object of all input conditions, is valid JSON schema
     * 4. Check if all statuses mentioned in transitions are present in the statuses object
     */

    const ajv = new Ajv();
    for (const result of (new SchemaVerify(ajv, schema, metaschema)).RunChecks()) {
      if (result.ok) {
        console.log(chalk.green(`${result.test}... ✓`));
      } else {
        console.log(chalk.red(`${result.test}... x`));
        for (const error of result.errors) {
          if (typeof error === 'object') {
            console.log('\t', chalk.red(JSON.stringify(error, null, 4)));
          } else {
            console.log('\t', chalk.red(error));
          }
        }
        if (!ignoreVerificationErrors) {
          throw new CommandError(`Schema ${schemaPath} contains error, please fix`);
        }
      }
    }
    console.log();
  };

  for (const f of files) {
    checkFile(f);
  }
}
