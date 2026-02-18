import * as templateRepository from '../../../repositories/templates';
import * as templateV2Repository from '../../../repositories/templatesV2';
import { isV1Template } from './utils';

export async function uploadTemplate(template: any) {
  if (isV1Template(template)) {
    await uploadV1Template(template);
  } else {
    await uploadV2Template(template);
  }
}

async function uploadV1Template(template: any) {
  const existingTemplate = await templateRepository.findByName(template.name);

  try {
    if (!existingTemplate) {
      console.log(`Creating new template '${template.name}'`);
      await templateRepository.create(template);
    } else {
      console.log(`Updating existing template '${template.name}'`);
      await templateRepository.update(existingTemplate.id, template);
    }
  } catch (err) {
    throw new Error(`Error creating or updating template: ${JSON.stringify(err.response)}`);
  }
}

async function uploadV2Template(template: any) {
  const existingTemplate = await templateV2Repository.findByName(template.name);

  try {
    if (!existingTemplate) {
      console.log(`Creating new template '${template.name}'`);
      await templateV2Repository.create(template);
    } else {
      console.log(`Updating existing template '${template.name}'`);
      await templateV2Repository.update(
        existingTemplate.id,
        // Make sure inputs and description are removed if they are not provided in the template file
        { inputs: null, description: null, ...template }
      );
    }
  } catch (err) {
    throw new Error(`Error creating or updating template: ${JSON.stringify(err.response)}`);
  }
}
