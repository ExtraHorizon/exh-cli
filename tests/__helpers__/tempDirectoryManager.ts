import { mkdir, readFile, rm, writeFile } from 'fs/promises';
import { join } from 'path';
import { generateId } from './utils';

export async function createTempDirectoryManager() {
  let dir: string | null = join(__dirname, `temp_${generateId()}`);
  await mkdir(dir);

  return {
    async createTempJsonFile(content: object) {
      return await this.createJsonFile(`${generateId()}-${generateId()}`, content);
    },
    async createTempJsFile(name: string, content: string) {
      return await this.createFile(`${name}.js`, content);
    },
    async createJsonFile(name: string, content: any) {
      return await this.createFile(`${name}.json`, JSON.stringify(content));
    },
    async createFile(name: string, content: any) {
      if (!dir) {
        throw new Error('Temp directory already removed');
      }

      const filePath = join(dir, name);
      await writeFile(filePath, content);

      return filePath;
    },
    async createDirectory(name: string) {
      if (!dir) {
        throw new Error('Temp directory already removed');
      }

      const newDir = join(dir, name);
      await mkdir(newDir);

      return newDir;
    },
    async readJsonFile(name: string) {
      const content = await this.readFile(`${name}.json`);
      return JSON.parse(content);
    },
    async readFile(name: string) {
      if (!dir) {
        throw new Error('Temp directory already removed');
      }

      const filePath = join(dir, name);
      console.log(`Reading file: ${filePath}`);
      try {
        return await readFile(filePath, 'utf-8');
      } catch (error) {
        if (error.code === 'ENOENT') {
          return null;
        }
        throw error;
      }
    },
    async removeDirectory() {
      if (!dir) {
        return;
      }

      await rm(dir, { recursive: true });
      dir = null;
    },
    getPath(subPath?: string) {
      if (!dir) {
        throw new Error('Temp directory already removed');
      }

      return subPath ? join(dir, subPath) : dir;
    },
  };
}
