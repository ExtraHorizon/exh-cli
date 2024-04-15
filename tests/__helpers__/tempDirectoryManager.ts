import { mkdir, rmdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { generateId } from './utils';

export async function createTempDirectoryManager() {
  let dir = join(__dirname, `temp_${generateId()}`);
  await mkdir(dir);

  return {
    createTempJsonFile: async (content: object) => {
      if (!dir) { throw new Error('Temp directory already removed'); }

      const filePath = join(dir, `${generateId()}-${generateId()}.json`);
      await writeFile(filePath, JSON.stringify(content));
      return filePath;
    },
    createTempJsFile: async (name: string, content: string) => {
      if (!dir) { throw new Error('Temp directory already removed'); }

      const filePath = join(dir, `${name}.js`);
      await writeFile(filePath, content);
      return filePath;
    },
    removeDirectory: async () => {
      await rmdir(dir, { recursive: true });
      dir = null;
    },
  };
}
