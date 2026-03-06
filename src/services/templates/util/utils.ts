import { readdir, readFile } from 'fs/promises';
import type { TemplateV1Config } from './models';

export async function listFolderContent(path: string) {
  return await readdir(path);
}

export async function readJsonFile(path: string) {
  const file = await readTextFile(path);
  return JSON.parse(file);
}

export async function readTextFile(path: string) {
  const fileBuffer = await readFile(path);
  return fileBuffer.toString();
}

export function removeFileNameExtension(fileName: string) {
  return fileName.split('.')[0];
}

export function isV1Template(template: any): template is TemplateV1Config {
  return (
    !!template.schema ||
    !!template.fields
  );
}
