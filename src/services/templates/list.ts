import { ServiceNotFoundError } from '@extrahorizon/javascript-sdk';
import * as chalk from 'chalk';
import * as templateRepository from '../../repositories/templates';
import * as templateV2Repository from '../../repositories/templatesV2';

export async function list(isTTY: boolean) {
  const templates = [];
  try {
    const templatesV1 = await templateRepository.findAll();
    templates.push(...templatesV1);
  } catch (error) {
    if (!(error instanceof ServiceNotFoundError)) {
      // Template service V1 might not be available anymore
      throw error;
    }
  }

  try {
    const templatesV2 = await templateV2Repository.findAll();
    templates.push(...templatesV2);
  } catch (error) {
    if (!(error instanceof ServiceNotFoundError)) {
      // Template service V2 might not be available yet
      throw error;
    }
  }

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
}
