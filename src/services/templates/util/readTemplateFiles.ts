import * as fs from 'fs/promises';
import * as path from 'path';
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
      templateFilesByName[templateName] = await readTemplateJson(filePath);
    }
  }

  return templateFilesByName;
}

export async function readTemplateJson(fileName: string) {
  return readJsonFile(fileName);
}

export async function readTemplateFolder(subFolder: string) {
  const templateFile = await readTemplateJson(path.join(subFolder, 'template.json'));
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
