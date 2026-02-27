import { ServiceNotFoundError, type Template, type TemplateV2 } from '@extrahorizon/javascript-sdk';
import * as chalk from 'chalk';
import * as templateRepository from '../../repositories/templates';
import * as templateV2Repository from '../../repositories/templatesV2';

export async function get(name?: string, id?: string) {
  let template: Template | TemplateV2 | null = await getFromV2(name, id);

  if (!template) {
    template = await getFromV1(name, id);
  }

  if (!template) {
    console.log(chalk.red('Failed to get template!'));
    return;
  }

  console.log(JSON.stringify(template, null, 4));
}

export async function getFromV1(name?: string, id?: string) {
  try {
    if (name) {
      return await templateRepository.findByName(name);
    }

    if (id) {
      return await templateRepository.findById(id);
    }
  } catch (error) {
    if (!(error instanceof ServiceNotFoundError)) {
      // Template service V1 might not be available anymore
      throw error;
    }
  }

  return null;
}

export async function getFromV2(name?: string, id?: string) {
  try {
    if (name) {
      return await templateV2Repository.findByName(name);
    }

    if (id) {
      return await templateV2Repository.findById(id);
    }
  } catch (error) {
    if (!(error instanceof ServiceNotFoundError)) {
      // Template service V2 might not be available yet
      throw error;
    }
  }

  return null;
}
