import type { Template } from '@extrahorizon/javascript-sdk';
import * as chalk from 'chalk';
import * as templateRepository from '../../repositories/templates';

export { sync } from './sync';

export async function list(isTTY: boolean) {
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
}

export async function get(name?: string, id?: string) {
  let template: Template;
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
}

export async function remove(name?: string, id?: string) {
  let template = null;
  if (name) {
    template = await templateRepository.findByName(name);
  }
  if (id) {
    template = await templateRepository.findById(id);
  }
  if (!template) {
    console.log(chalk.red('Template not found!'));
    return;
  }
  try {
    const { affectedRecords } = await templateRepository.remove(template.id);
    if (!affectedRecords) {
      console.log(chalk.red('Failed to remove template', name));
      return;
    }
    console.log('Template deleted');
  } catch (err) {
    console.log(chalk.red('Failed to remove template', name));
  }
}
