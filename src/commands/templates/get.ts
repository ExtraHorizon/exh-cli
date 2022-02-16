import { OAuth1Client } from '@extrahorizon/javascript-sdk';
import chalk = require('chalk');
import { epilogue } from '../../helpers/util';

export const command = 'get';
export const desc = 'Fetch a template';
export const builder = (yargs: any) => epilogue(yargs).options({
  name: {
    demandOption: true,
    describe: 'Name of the template',
    type: 'string',
  },
});

export const handler = async function list({ sdk, name }: {sdk: OAuth1Client; name: string;}) {
  try {
    const template = await sdk.templates.findByName(name);
    if (!template) {
      console.log(chalk.red('Failed to get template!'));
      return;
    }
    console.log(JSON.stringify(template, null, 4));
  } catch (err) {
    console.log(chalk.red('Failed to get template', name));
  }
};
