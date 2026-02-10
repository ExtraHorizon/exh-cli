import chalk = require('chalk');
import { getSdk } from '../../exh';
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

export const handler = async function list({ name, id }: { name: string; id: string; }) {
  let template = null;
  if (name) {
    template = await getSdk().templates.findByName(name);
  }
  if (id) {
    template = await getSdk().templates.findById(id);
  }
  if (!template) {
    console.log(chalk.red('Template not found!'));
    return;
  }
  try {
    const { affectedRecords } = await getSdk().templates.remove(template.id);
    if (!affectedRecords) {
      console.log(chalk.red('Failed to remove template', name));
      return;
    }
    console.log('Template deleted');
  } catch (err) {
    console.log(chalk.red('Failed to remove template', name));
  }
};
