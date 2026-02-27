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

  if (!templateFilesByName[name]) {
    throw new Error(`Template file dependency ${name} not found!`);
  }

  const { variables, ...templateFile } = templateFilesByName[name];

  if (variables && templateFile.outputs) {
    templateFile.outputs = replaceVariables(templateFile.outputs, variables);
    // Make sure to update the template file in the map with the outputs that have had their variables replaced,
    // so that if another template is extended from this template, it will get the outputs with the variables replaced
    // eslint-disable-next-line no-param-reassign
    templateFilesByName[name] = templateFile;
  }

  let templateConfig;
  if (templateFile.extends_template) {
    templateConfig = await extendV1Template(name, templateFilesByName, newCallChain);
  } else if (templateFile.extendsTemplate) {
    templateConfig = await extendV2Template(name, templateFilesByName, newCallChain);
  } else {
    templateConfig = { ...templateFile, name };
  }

  if (!isV1Template(templateConfig)) {
    validateV2Template(templateConfig);
  }

  return templateConfig;
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
  const { extendsTemplate, description, inputs, outputs } = templateFilesByName[name];

  if (!templateFilesByName[extendsTemplate]) {
    // eslint-disable-next-line no-param-reassign
    templateFilesByName[extendsTemplate] = await templateV2Repository.findByName(extendsTemplate);
  }

  const extendingTemplate = await buildTemplate(extendsTemplate, templateFilesByName, callChain);
  if (isV1Template(extendingTemplate)) {
    throw v2ExtendingV1Error(extendsTemplate, callChain);
  }

  // Used in the regex replacement below to replace {{@inputs.variableName}} with the value from the current template's outputs
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
      .replace(/{{[ ]*@inputs\.([a-zA-Z0-9_-]+)[ ]*}}/g, resolveMatch);

    newOutputs[output] = extendedValue;
  }

  return {
    name,
    description,
    inputs,
    outputs: newOutputs,
  };
}

function replaceVariables(outputs: Record<string, any>, variables: Record<string, string>) {
  const replaced: Record<string, string> = {};

  const resolvedVariables: Record<string, string> = {};
  // Replaces the value of variables that reference environment variables with their resolved value from the environment
  for (const [varName, varValue] of Object.entries(variables)) {
    resolvedVariables[varName] = resolveVariableValue(varValue);
  }

  // For each output, replace any instance of ${VAR} or $VAR with the value of the variable from the current template's variables
  for (const [key, value] of Object.entries(outputs)) {
    let replacedValue = value;
    for (const [varName, varValue] of Object.entries(resolvedVariables)) {
      // Replace both ${VAR} and $VAR
      replacedValue = replacedValue
        .replaceAll(`\${${varName}}`, varValue)
        .replaceAll(`$${varName}`, varValue);
    }
    replaced[key] = replacedValue;
  }

  return replaced;
}

function resolveVariableValue(value: string): string {
  // Expecting only the environment variable in here, not a string that contains the environment variable
  if (!value.startsWith('$')) { return value; }

  // Replace both ${VAR} and $VAR
  const envVar = value.startsWith('${') && value.endsWith('}') ?
    value.slice(2, -1) :
    value.slice(1);

  const validEnvPattern = /^[A-Z][A-Z0-9_]*$/;

  if (!validEnvPattern.test(envVar)) {
    throw new Error(
      `Invalid environment variable name ${envVar}. Environment variable names must contain only uppercase letters, numbers, and underscores and must start with a letter.`
    );
  }

  const resolved = process.env[envVar];

  if (resolved === undefined) {
    throw new Error(`Variable ${envVar} not found in environment`);
  }

  return resolved;
}

function validateV2Template(template: any) {
  // Template names must be "safe strings"
  if (!/^[A-Za-z][A-Za-z0-9_-]{0,49}$/.test(template.name)) {
    throw new Error(`Template name '${template.name}' is invalid. Template names must start with a letter and can only contain letters, numbers, underscores and hyphens, and be at most 50 characters long.`);
  }

  // Templates must have at least one output
  if (Object.keys(template.outputs || {}).length < 1) {
    throw new Error(`Template '${template.name}' must have at least one output defined.`);
  }

  // Output names must be "safe strings"
  for (const outputName of Object.keys(template.outputs)) {
    if (!/^[A-Za-z][A-Za-z0-9_-]{0,49}$/.test(outputName)) {
      throw new Error(`Output name '${outputName}' is invalid. Output names must start with a letter and can only contain letters, numbers, underscores and hyphens, and be at most 50 characters long.`);
    }
  }
}

function v1ExtendingV2Error(extendsTemplate: string, callChain: string[]) {
  return new Error(
    `You cannot extend a v2 template ('${extendsTemplate}') in a v1 template.` +
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
    `You cannot extend a v1 template ('${extendsTemplate}') in a v2 template.` +
    `In ${renderCallChain(callChain)}`
  );
}

function v2VariableNotFoundError(variableName: string, extendsTemplate: string, callChain: string[]) {
  return new Error(
    `Could not find a value to fill '{{@inputs.${variableName}}}' ` +
    `while extending '${extendsTemplate}' ` +
    `in ${renderCallChain(callChain)}`
  );
}

function renderCallChain(callChain: string[]) {
  return callChain.reverse().map(part => `'${part}'`).join(' > ');
}
