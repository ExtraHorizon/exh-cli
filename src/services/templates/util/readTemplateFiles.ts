import * as fs from 'fs/promises';
import * as path from 'path';
import * as templateConfigSchema from '../../../config-json-schemas/Template.json';
import { ajvValidate } from '../../../helpers/util';
import type { TemplateConfig } from './models';
import { listFolderContent, readTextFile, readJsonFile, removeFileNameExtension, isV1Template } from './utils';

export async function readTemplateFiles(targetFolder: string) {
  const fileNames = await listFolderContent(targetFolder);

  const templateFilesByName = {};
  for (const fileName of fileNames) {
    const filePath = path.join(targetFolder, fileName);

    if ((await fs.stat(filePath)).isDirectory()) {
      templateFilesByName[fileName] = await readTemplateFolder(filePath);
    } else if (fileName.endsWith('.json')) {
      const templateName = removeFileNameExtension(fileName);
      templateFilesByName[templateName] = await readAndValidateTemplateJson(filePath);
    }
  }

  return templateFilesByName;
}

export async function readAndValidateTemplateJson(fileName: string) {
  try {
    const content = await readJsonFile(fileName);
    console.log(`${fileName} - ${content}`);
    if (!isV1Template(content)) {
      ajvValidate<TemplateConfig>(templateConfigSchema, content);
    }
    return content;
  } catch (error) {
    throw new Error(`Error while reading template file ${fileName}: ${error.message}`);
  }
}

export async function readTemplateFolder(subFolder: string) {
  const templateFile = await readAndValidateTemplateJson(path.join(subFolder, 'template.json'));
  const extraFiles = await readExtraTemplateFolderFiles(subFolder);

  if (isV1Template(templateFile)) {
    templateFile.fields = {
      ...templateFile.fields,
      ...extraFiles,
    };
  } else {
    templateFile.outputs = {
      ...templateFile.outputs,
      ...extraFiles,
    };
  }

  return templateFile;
}

async function readExtraTemplateFolderFiles(subFolder: string) {
  const extraFiles = {};

  const fileNames = await listFolderContent(subFolder);
  for (const fileName of fileNames) {
    if (fileName === 'template.json') {
      continue;
    }
    const name = removeFileNameExtension(fileName);
    const content = await readTextFile(path.join(subFolder, fileName));

    extraFiles[name] = content;
  }

  return extraFiles;
}
