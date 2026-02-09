import chalk = require('chalk');
import { getSdk } from '../../exh';
import { epilogue } from '../../helpers/util';

export const command = 'list';
export const desc = 'List all templates';
export const builder = (yargs: any) => epilogue(yargs);

export const handler = async function list({ isTTY }: { isTTY: boolean; }) {
  const templates = await getSdk().templates.findAll();
  if (templates) {
    if (!templates.length) {
      console.log(chalk.red('No templates found'));
      return;
    }
    if (isTTY) {
      console.table(templates.map((c:any) => ({ Id: c.id, Name: c.name, Description: c.description || '<none>', 'Last updated': c.updateTimestamp.toISOString() })));
    } else {
      templates.forEach((f:any) => (console.log(f)));
    }
  }
};
