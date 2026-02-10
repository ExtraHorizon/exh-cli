import chalk = require('chalk');
import { epilogue } from '../../helpers/util';
import * as templateRepository from '../../repositories/templates';

export const command = 'list';
export const desc = 'List all templates';
export const builder = (yargs: any) => epilogue(yargs);

export const handler = async function list({ isTTY }: { isTTY: boolean; }) {
  const templates = await templateRepository.findAll();

  if (templates.length < 1) {
    console.log(chalk.red('No templates found'));
    return;
  }

  if (isTTY) {
    console.table(templates.map(template => ({
      Id: template.id,
      Name: template.name,
      Description: template.description || '<none>',
      'Last updated': template.updateTimestamp.toISOString(),
    })));
  } else {
    templates.forEach(template => console.log(template));
  }
};
