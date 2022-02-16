import { OAuth1Client } from '@extrahorizon/javascript-sdk';
import chalk = require('chalk');
import { epilogue } from '../../helpers/util';

export const command = 'delete';
export const desc = 'Delete a template';
export const builder = (yargs: any) => epilogue(yargs).options({
  name: {
    describe: 'Name of the template to delete',
    type: 'string',
  },
  id: {
    describe: 'ID of the template to delete',
    type: 'string',
  },
}).check(({ id, name }) => {
  if ((!id && !name) || (id && name)) {
    throw new Error('Either id or name needs to be provided');
  }
  return true;
});

export const handler = async function list({ sdk, name, id }: {sdk: OAuth1Client; name: string; id: string;}) {
  let template = null;
  if (name) {
    template = await sdk.templates.findByName(name);
  }
  if (id) {
    template = await sdk.templates.findById(id);
  }
  if (!template) {
    console.log(chalk.red('Template not found!'));
    return;
  }
  try {
    const { affectedRecords } = await sdk.templates.remove(template.id);
    if (!affectedRecords) {
      console.log(chalk.red('Failed to remove template', name));
      return;
    }
    console.log('Template deleted');
  } catch (err) {
    console.log(chalk.red('Failed to remove template', name));
  }
};
