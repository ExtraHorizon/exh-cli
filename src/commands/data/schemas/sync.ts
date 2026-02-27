import { epilogue } from '../../../helpers/util';
import * as schemaService from '../../../services/schemas';

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

export const handler = async ({ file, dir, dry, ignoreVerificationErrors }) => {
  await schemaService.sync(file, dir, dry, ignoreVerificationErrors);
};
