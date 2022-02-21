import { TemplateService } from './templateService';

export async function uploadTemplate(service: TemplateService, template: any) {
  const existingTemplate = await service.byName(template.name);

  if (!existingTemplate) {
    console.log(`Creating new template '${template.name}'`);
    await service.create(template);
  } else {
    console.log(`Updating existing template '${template.name}'`);
    await service.update(existingTemplate.id, template);
  }
}
