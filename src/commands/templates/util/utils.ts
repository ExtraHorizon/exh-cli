import { readdir, readFile } from 'fs/promises';

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
