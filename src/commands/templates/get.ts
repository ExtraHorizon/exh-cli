import type { TemplateOut } from '@extrahorizon/javascript-sdk';
import chalk = require('chalk');
import { epilogue } from '../../helpers/util';
import * as templateRepository from '../../repositories/templates';

export const command = 'get';
export const desc = 'Fetch a template';
export const builder = (yargs: any) => epilogue(yargs).options({
  name: {
    describe: 'Name of the template',
    type: 'string',
  },
  id: {
    describe: 'ID of the template',
    type: 'string',
  },

}).check(({ name, id }) => {
  if ((name && id) || (!name && !id)) {
    throw new Error('Either name or id should be specified (but not both at the same time)');
  }
  return true;
});

export const handler = async function list({ name, id }: { name?: string; id?: string; }) {
  let template: TemplateOut;
  if (name) {
    template = await templateRepository.findByName(name);
  } else if (id) {
    template = await templateRepository.findById(id);
  }

  if (!template) {
    console.log(chalk.red('Failed to get template!'));
    return;
  }

  console.log(JSON.stringify(template, null, 4));
};
