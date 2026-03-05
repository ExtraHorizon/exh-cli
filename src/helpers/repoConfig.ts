import * as fs from 'fs';
import * as ospath from 'path';
import * as chalk from 'chalk';

export const REPO_CONFIG_FILE = 'repo-config.json';

function getDefaultConfig(targetPath: string): any {
  const config = {};
  const sections = ['schemas', 'templates', 'tasks', 'localizations'];

  for (const s of sections) {
    if (pathExists(ospath.join(targetPath, s))) {
      config[s] = [s];
    }
  }

  return config;
}

function validateRepoConfig(targetPath: string, config: any) {
  const checkDirAccess = (basePath:string, paths: string[]): string[] => {
    const result = [];
    if (!Array.isArray(paths)) {
      throw new Error('Not an array');
    }

    for (const p of paths) {
      if (!pathExists(ospath.join(basePath, p))) {
        console.log(chalk.yellow(`Warning: '${p}' directory not found`));
        continue;
      }

      if (!isDirectory(ospath.join(basePath, p))) {
        throw new Error(`${p} is not a directory`);
      }
      result.push(p);
    }
    return result;
  };

  const newConfig = { ...config };
  for (const [key] of Object.entries(config)) {
    newConfig[key] = checkDirAccess(targetPath, config[key]);
  }
  return newConfig;
}

export function getRepoConfig(targetPath: string): any {
  let cfg = getDefaultConfig(targetPath);

  /* Read config file */
  try {
    const fileContent = fs.readFileSync(ospath.join(targetPath, REPO_CONFIG_FILE), 'utf-8');
    cfg = JSON.parse(fileContent);
  } catch (err) { /* */ }

  return validateRepoConfig(targetPath, cfg);
}

function pathExists(p: string): boolean {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function isDirectory(path: string): boolean {
  return fs.statSync(path).isDirectory();
}
