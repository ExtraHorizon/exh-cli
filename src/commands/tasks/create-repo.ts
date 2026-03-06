import { epilogue } from '../../helpers/util';
import * as tasksService from '../../services/tasks';

export const command = 'create-repo <name>';
export const desc = 'Create a new task repository';
export const builder = (yargs: any) => epilogue(yargs)
  .positional('name', {
    demandOption: true,
    description: 'The name of the new repo/task',
    type: 'string',
  })
  .options({
    repo: {
      description: 'repository template to clone',
      type: 'string',
      default: 'https://github.com/ExtraHorizon/template-task',
    },
    git: {
      description: 'also initializes the cloned repository as a fresh git repository',
      type: 'boolean',
      default: false,
    },
    path: {
      description: 'the path where the new repo/task should be created',
      type: 'string',
      default: './',
    },
  });

export const handler = async ({ name, repo, git, path }) => {
  await tasksService.createRepo({ name, repo, git, path });
};
