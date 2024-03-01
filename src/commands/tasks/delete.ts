import * as chalk from 'chalk';
import * as functionRepository from '../../repositories/functions';
import { epilogue } from '../../helpers/util';

export const command = 'delete';
export const desc = 'Delete a task';
export const builder = (yargs: any) => epilogue(yargs).option('name', {
  demandOption: true,
  description: 'The name of the task',
  type: 'string',
});

export const handler = async ({ sdk, name }) => {
  try {
    const response = await functionRepository.remove(sdk, name);
    if (response?.affectedRecords) {
      console.log(chalk.green('Successfully deleted task', name));
    } else {
      console.log(chalk.red('Failed to delete task', name));
    }
  } catch (err) {
    console.log(chalk.red('Failed to delete task:', err.message));
  }
};
