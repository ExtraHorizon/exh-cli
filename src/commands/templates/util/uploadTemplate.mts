import { TemplateService } from './templateService.mjs';

export async function uploadTemplate(service: TemplateService, template: any) {
  const existingTemplate = await service.byName(template.name);

  try {
    if (!existingTemplate) {
      console.log(`Creating new template '${template.name}'`);
      await service.create(template);
    } else {
      console.log(`Updating existing template '${template.name}'`);
      await service.update(existingTemplate.id, template);
    }
  } catch (err) {
    throw new Error(`Error creating or updating template: ${JSON.stringify(err.response)}`);
  }
}
