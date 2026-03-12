import { epilogue } from '../../helpers/util';
import * as tasksService from '../../services/tasks';

export const command = 'create-repo <name>';
export const desc = false; // hide from help output since this command is deprecated in favor of "init"
export const deprecated = 'Use "exh tasks init" instead, which has more consistent behavior with other "init" commands.';
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
  await tasksService.init({ name, repo, git, path });
};
