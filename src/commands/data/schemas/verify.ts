import * as fs from 'fs';
import * as path from 'path';
import Ajv from 'ajv';
import * as chalk from 'chalk';
import { CommandError } from '../../../helpers/error';
import { epilogue } from '../../../helpers/util';
import { flatListFiles } from './util/listFilesInDir';
import * as metaschema from './util/metaschema.json';
import { SchemaVerify } from './util/schemaverify';

export const command = 'verify';
export const desc = 'Syntactically verify a local schema';
export const builder = (yargs: any) => epilogue(yargs).options({
  file: {
    describe: 'schema json file which needs to be verified',
    type: 'string',
  },
  dir: {
    describe: 'directory containing schemas to be verified',
    type: 'string',
  },
}).check(({ file, dir }) => {
  if (file && (!fs.existsSync(path.resolve(file)) || !fs.lstatSync(path.resolve(file)).isFile())) {
    throw new Error('Schema file does not exist, please make sure you provided the correct file path');
  }
  if (dir === undefined && file === undefined) {
    throw new Error('Must either specify --file or --dir');
  } else if (dir !== undefined && file !== undefined) {
    throw new Error('Cannot specify both --file and --dir');
  }
  return true;
});

export const handler = async ({ file, dir, ignoreVerificationErrors }) => {
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
   * 1. Check if the schema complies to ExH data schema format ('metaschema.json')
   * 2. Check if the properties object, if present, is valid JSON schema
   * 3. Check if the configuration object of all input conditions, is valid JSON schema
   * 4. Check if all statuses mentioned in transitions are present in the statuses object
   * 5. Check if the correct conditions are used in the transitions
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
};
