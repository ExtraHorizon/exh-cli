import { epilogue } from '../../helpers/util';
import * as tasksService from '../../services/tasks';

export const command = 'delete';
export const desc = 'Delete a task';
export const builder = (yargs: any) => epilogue(yargs).option('name', {
  demandOption: true,
  description: 'The name of the task',
  type: 'string',
});

export const handler = async ({ name }) => {
  await tasksService.remove(name);
};
