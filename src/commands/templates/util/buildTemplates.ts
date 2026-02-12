/* eslint-disable camelcase */
import * as templateRepository from '../../../repositories/templates';
import * as templateV2Repository from '../../../repositories/templatesV2';
import { isV1Template } from './utils';

export async function buildTemplates(templateFilesByName: any) {
  const templates = [];
  for (const name of Object.keys(templateFilesByName)) {
    templates.push(await buildTemplate(name, templateFilesByName));
  }
  return templates;
}

async function buildTemplate(name: string, templateFilesByName: any, callChain = []) {
  const newCallChain = [...callChain, name];
  if (callChain.includes(name)) {
    throw new Error(`Circular extension detected. ${renderCallChain(newCallChain)}`);
  }

  const templateFile = templateFilesByName[name];
  if (!templateFile) {
    throw new Error(`Template file dependency ${name} not found!`);
  }

  if (templateFile.extends_template) {
    return await extendV1Template(name, templateFilesByName, newCallChain);
  }

  if (templateFile.extendsTemplate) {
    return await extendV2Template(name, templateFilesByName, newCallChain);
  }

  return { ...templateFile, name };
}

async function extendV1Template(name: string, templateFilesByName: any, callChain: string[]) {
  const { extends_template, description, schema, fields } = templateFilesByName[name];

  if (!templateFilesByName[extends_template]) {
    // eslint-disable-next-line no-param-reassign
    templateFilesByName[extends_template] = await templateRepository.findByName(extends_template);
  }

  const extendingTemplate = await buildTemplate(extends_template, templateFilesByName, callChain);
  if (!isV1Template(extendingTemplate)) {
    throw v1ExtendingV2Error(extends_template, callChain);
  }

  // Used in the regex replacement below to replace $content.variableName with the value from the current template's fields
  const resolveMatch = (_fullMatch: any, variableName: string) => {
    const value = fields[variableName];
    if (typeof value === 'undefined') {
      throw v1VariableNotFoundError(variableName, extends_template, callChain);
    }

    return value;
  };

  const extendedFields = {};
  for (const extendingField of Object.keys(extendingTemplate.fields)) {
    const extendedValue = extendingTemplate.fields[extendingField]
      .replace(/\$content\.([a-z0-9_-]+)/ig, resolveMatch);

    extendedFields[extendingField] = extendedValue;
  }

  return {
    name,
    description,
    schema,
    fields: extendedFields,
  };
}

async function extendV2Template(name: string, templateFilesByName: any, callChain: string[]) {
  const { extendsTemplate, description, properties, outputs } = templateFilesByName[name];

  if (!templateFilesByName[extendsTemplate]) {
    // eslint-disable-next-line no-param-reassign
    templateFilesByName[extendsTemplate] = await templateV2Repository.findByName(extendsTemplate);
  }

  const extendingTemplate = await buildTemplate(extendsTemplate, templateFilesByName, callChain);
  if (isV1Template(extendingTemplate)) {
    throw v2ExtendingV1Error(extendsTemplate, callChain);
  }

  // Used in the regex replacement below to replace {{@data.variableName}} with the value from the current template's outputs
  const resolveMatch = (_fullMatch: any, variableName: string) => {
    const value = outputs[variableName];
    if (typeof value === 'undefined') {
      throw v2VariableNotFoundError(variableName, extendsTemplate, callChain);
    }

    return value;
  };

  const newOutputs = {};
  for (const output of Object.keys(extendingTemplate.outputs)) {
    const extendedValue = extendingTemplate.outputs[output]
      .replace(/{{[ ]*@data\.([a-zA-Z0-9_-]+)[ ]*}}/g, resolveMatch);

    newOutputs[output] = extendedValue;
  }

  return {
    name,
    description,
    properties,
    outputs: newOutputs,
  };
}

function v1ExtendingV2Error(extendsTemplate: string, callChain: string[]) {
  return new Error(
    `You cannot extend a v2 template ('${extendsTemplate}') in a v1 template!` +
    `In ${renderCallChain(callChain)}`
  );
}

function v1VariableNotFoundError(variableName: string, extendsTemplate: string, callChain: string[]) {
  return new Error(
    `Could not find a value to fill '$content.${variableName}' ` +
    `while extending '${extendsTemplate}' ` +
    `in ${renderCallChain(callChain)}`
  );
}

function v2ExtendingV1Error(extendsTemplate: string, callChain: string[]) {
  return new Error(
    `You cannot extend a v1 template ('${extendsTemplate}') in a v2 template!` +
    `In ${renderCallChain(callChain)}`
  );
}

function v2VariableNotFoundError(variableName: string, extendsTemplate: string, callChain: string[]) {
  return new Error(
    `Could not find a value to fill '{{@data.${variableName}}}' ` +
    `while extending '${extendsTemplate}' ` +
    `in ${renderCallChain(callChain)}`
  );
}

function renderCallChain(callChain: string[]) {
  return callChain.reverse().map(part => `'${part}'`).join(' > ');
}
