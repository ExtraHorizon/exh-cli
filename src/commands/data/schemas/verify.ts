import * as fs from 'fs';
import * as path from 'path';
import { epilogue } from '../../../helpers/util';
import * as schemaService from '../../../services/schemas';

export const command = 'verify';
export const desc = 'Syntactically verify a local schema';
export const builder = (yargs: any) => epilogue(yargs)
  .options({
    file: {
      description: 'schema json file which needs to be verified',
      type: 'string',
    },
    dir: {
      description: 'directory containing schemas to be verified',
      type: 'string',
    },
  })
  .check(({ file, dir }) => {
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
  await schemaService.verify(file, dir, ignoreVerificationErrors);
};
