import * as templateRepository from '../../../repositories/templates';

export async function uploadTemplate(template: any) {
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
