import * as fs from 'fs';
import * as ospath from 'path';
import { epilogue } from '../../helpers/util';
import * as templateService from '../../services/templates';

export const command = 'sync';
export const desc = 'Sync all templates in a directory with the ExH cloud';
export const builder = (yargs: any) => epilogue(yargs)
  .options({
    path: {
      demandOption: false,
      description: 'Directory containing the templates which need to be synced',
      type: 'string',
    },
    template: {
      demandOption: false,
      description: 'Template file to sync',
      type: 'string',
    },
  })
  .check(({ path, template }) => {
    if (template && !fs.existsSync(ospath.join(process.cwd(), template))) {
      throw new Error('please provide a valid file path for your template');
    }
    if (path && (!fs.existsSync(ospath.join(process.cwd(), path)) || fs.statSync(ospath.join(process.cwd(), path)).isFile())) {
      throw new Error('please provide a valid directory path for your code');
    }

    if ((template && path) || (!template && !path)) {
      throw new Error('Either path or template must be specified (but not both at the same time)');
    }
    return true;
  });

export const handler = async ({ path, template }: { path?: string; template?: string; }) => {
  await templateService.sync(path, template);
};
