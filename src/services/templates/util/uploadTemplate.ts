import * as templateRepository from '../../../repositories/templates';
import * as templateV2Repository from '../../../repositories/templatesV2';
import { isV1Template } from './utils';

export async function uploadTemplate(template: any) {
  console.log(`Syncing template: '${template.name}'`);

  if (isV1Template(template)) {
    await uploadV1Template(template);
  } else {
    await uploadV2Template(template);
  }
}

async function uploadV1Template(template: any) {
  try {
    const existingTemplate = await templateRepository.findByName(template.name);

    if (!existingTemplate) {
      await templateRepository.create(template);
    } else {
      await templateRepository.update(existingTemplate.id, template);
    }
  } catch (err) {
    throw new Error(`Error creating or updating template: ${JSON.stringify(err.response)}`);
  }
}

async function uploadV2Template(template: any) {
  try {
    const existingTemplate = await templateV2Repository.findByName(template.name);

    if (!existingTemplate) {
      await templateV2Repository.create(template);
    } else {
      // Make sure inputs and description will be removed if not provided in the template file
      const update = { description: null, inputs: null, ...template };
      await templateV2Repository.update(existingTemplate.id, update);
    }
  } catch (err) {
    throw new Error(`Error creating or updating template: ${JSON.stringify(err.response)}`);
  }
}
