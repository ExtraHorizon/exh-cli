import { readdirSync, statSync } from 'fs';
import * as path from 'path';

/**
 * recursively list files inside a target dir
 * @param {string} dirPath path to the target directory, can be a relative path from where the function is called
 * @param {string} [extensionFilter] optional, only return files with this extension
 * @returns {string[]} the flattened list of file paths inside the directory
 */
export function flatListFiles(dirPath: string, extensionFilter?: string): string[] {
  const files = readdirSync(dirPath);

  return files.flatMap(file => {
    const filePath = path.join(dirPath, file);
    const fileStat = statSync(filePath);

    // check if the target file is a directory
    if (fileStat.isDirectory()) {
      // parse list files inside dirs recursively
      return flatListFiles(filePath, extensionFilter);
    }

    if (fileStat.isFile()) {
      if (!extensionFilter) {
        return filePath;
      }
      if (filePath.endsWith(extensionFilter)) {
        return filePath;
      }
    }
    return null;
  }).filter(file => file);
}
