import { ServiceNotFoundError } from '@extrahorizon/javascript-sdk';
import * as chalk from 'chalk';
import * as templateRepository from '../../repositories/templates';
import * as templateV2Repository from '../../repositories/templatesV2';
import { getFromV1, getFromV2 } from './get';

export async function remove(name?: string, id?: string) {
  let isRemoved = await removeFromV2(name, id);

  if (!isRemoved) {
    isRemoved = await removeFromV1(name, id);
  }

  if (!isRemoved) {
    console.log(chalk.red('Template not found!'));
  } else {
    console.log('Template deleted');
  }
}

async function removeFromV1(name?: string, id?: string) {
  const template = await getFromV1(name, id);
  if (!template) {
    return false;
  }

  try {
    await templateRepository.remove(template.id);
    return true;
  } catch (error) {
    if (!(error instanceof ServiceNotFoundError)) {
      // Template service V1 might not be available anymore
      throw error;
    }
  }

  return false;
}

async function removeFromV2(name?: string, id?: string) {
  const template = await getFromV2(name, id);
  if (!template) {
    return false;
  }

  try {
    await templateV2Repository.remove(template.id);
    return true;
  } catch (error) {
    if (!(error instanceof ServiceNotFoundError)) {
      // Template service V2 might not be available yet
      throw error;
    }
  }

  return false;
}
