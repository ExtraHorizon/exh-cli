import { OAuth1Client } from '@extrahorizon/javascript-sdk';
import chalk from 'chalk';
import { epilogue } from '../../helpers/util.mjs';

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

export const handler = async function list({ sdk, name, id }: {sdk: OAuth1Client; name: string; id: string;}) {
  try {
    const template = name ? await sdk.templates.findByName(name) : await sdk.templates.findById(id);
    if (!template) {
      console.log(chalk.red('Failed to get template!'));
      return;
    }
    console.log(JSON.stringify(template, null, 4));
  } catch (err) {
    console.log(chalk.red('Failed to get template', name));
  }
};
