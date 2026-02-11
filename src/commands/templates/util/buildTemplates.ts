/* eslint-disable camelcase */
import * as templateRepository from '../../../repositories/templates';

export async function buildTemplates(templateFilesByName: any) {
  const templates = [];
  for (const name of Object.keys(templateFilesByName)) {
    templates.push(await buildTemplate(name, templateFilesByName));
  }
  return templates;
}

async function buildTemplate(name: string, templateFilesByName: any, callChain = []) {
  if (callChain.includes(name)) {
    throw new Error(`Circular extension detected. ${[...callChain, name].reverse().map((n:string) => `'${n}'`).join(' > ')}`);
  }

  let templateFile = templateFilesByName[name];

  if (templateFile === undefined) {
    templateFile = await templateRepository.findByName(name);
    if (!templateFile) {
      throw new Error(`Template file dependency ${name} not found!`);
    }
  }

  const { description, extends_template, schema } = templateFile;
  let { fields } = templateFile;

  if (extends_template) {
    const extendingTemplate = await buildTemplate(extends_template, templateFilesByName, [...callChain, name]);

    const match = (_fullMatch: any, variableName: string) => {
      const value = fields[variableName];
      if (typeof value === 'undefined') {
        throw new Error(
          `Could not find a value to fill '$content.${variableName}' ` +
              `while extending '${extends_template}' ` +
              `in ${[...callChain, name].reverse().map(n => `'${n}'`).join(' > ')}`
        );
      }

      return value;
    };

    const extendedFields = {};
    for (const extendingField of Object.keys(extendingTemplate.fields)) {
      const extendedValue = extendingTemplate.fields[extendingField]
        .replace(/\$content\.([a-z0-9_-]+)/ig, match);

      extendedFields[extendingField] = extendedValue;
    }

    fields = extendedFields;
  }

  return {
    name,
    description,
    schema,
    fields,
  };
}
