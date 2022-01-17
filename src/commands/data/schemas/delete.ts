import * as chalk from 'chalk';
import { epilogue } from '../../../helpers/util';

export const command = 'delete';
export const desc = 'Delete a schema';
export const builder = (yargs: any) => epilogue(yargs).option('id', {
  demandOption: true,
  description: 'The ID of the schema',
  type: 'string',
});

export const handler = async ({ sdk, id }) => {
  const disableResponse = await sdk.raw.post(`/data/v1/${id}/disable`);
  if (disableResponse.data?.affectedRecords !== 1) {
    console.log(chalk.red('Failed to delete schema', id));
    return;
  }
  const deleteResponse = await sdk.raw.delete(`/data/v1/${id}`);
  if (deleteResponse.data?.affectedRecords) {
    console.log(chalk.green('Successfully deleted schema', id));
  } else {
    console.log(chalk.red('Failed to delete schema', id));
  }
};
