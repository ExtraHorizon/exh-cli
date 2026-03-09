import { epilogue } from '../../helpers/util';
import * as tasksService from '../../services/tasks';

export const command = 'init <name>';
export const desc = 'Create a new task';
export const builder = (yargs: any) => epilogue(yargs)
  .positional('name', {
    demandOption: true,
    description: 'The name of the new task',
    type: 'string',
  })
  .options({
    repo: {
      description: 'Git repository template to clone',
      type: 'string',
      default: 'https://github.com/ExtraHorizon/template-task',
    },
    path: {
      description: 'the path where the new task should be created',
      type: 'string',
      default: './tasks',
    },
  });

export const handler = async ({ name, repo, path }) => {
  await tasksService.init({ name, repo, path });
};
