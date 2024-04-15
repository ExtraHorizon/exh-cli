import * as chalk from 'chalk';
import { epilogue } from '../../../helpers/util';
import * as schemaRepository from '../../../repositories/schemas';

export const command = 'delete';
export const desc = 'Delete a schema';
export const builder = (yargs: any) => epilogue(yargs).option('id', {
  demandOption: true,
  description: 'The ID of the schema',
  type: 'string',
});

export const handler = async ({ sdk, id }) => {
  const disableResponse = await schemaRepository.disable(sdk, id);
  if (disableResponse.affectedRecords !== 1) {
    console.log(chalk.red('Failed to delete schema', id));
    return;
  }

  const deleteResponse = await schemaRepository.remove(sdk, id);
  if (deleteResponse.affectedRecords) {
    console.log(chalk.green('Successfully deleted schema', id));
  } else {
    console.log(chalk.red('Failed to delete schema', id));
  }
};
