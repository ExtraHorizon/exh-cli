import * as fs from 'fs/promises';
import * as path from 'path';
import { listFolderContent, readTextFile, readJsonFile, removeFileNameExtension } from './utils';

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

  const templateFields = await readTemplateFolderFieldFiles(subFolder);
  if (!templateFile.fields) {
    templateFile.fields = templateFields;
  } else {
    templateFile.fields = {
      ...templateFile.fields,
      ...templateFields,
    };
  }

  return templateFile;
}

async function readTemplateFolderFieldFiles(subFolder: string) {
  const templateFields = {};

  const folderFileNames = await listFolderContent(subFolder);
  const fieldFileNames = folderFileNames.filter((fileName: string) => fileName !== 'template.json');
  for (const fieldFileName of fieldFileNames) {
    const fieldName = removeFileNameExtension(fieldFileName);
    const fieldContent = await readTextFile(path.join(subFolder, fieldFileName));

    templateFields[fieldName] = fieldContent;
  }

  return templateFields;
}
