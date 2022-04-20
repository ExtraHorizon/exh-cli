import * as fs from 'fs/promises';
import * as ospath from 'path';
import * as chalk from 'chalk';

export const REPO_CONFIG_FILE = 'repo-config.json';

async function getDefaultConfig(targetPath: string): Promise<any> {
  const config = {};
  const sections = ['schemas', 'templates', 'tasks'];

  for (const s of sections) {
    try {
      await fs.access(ospath.join(targetPath, s));
      config[s] = [s];
    } catch (err) { continue; }
  }
  return config;
}

async function validateRepoConfig(targetPath: string, config: any) {
  const checkDirAccess = async (basePath:string, paths: string[]): Promise<string[]> => {
    const result = [];
    if (!Array.isArray(paths)) {
      throw new Error('Not an array');
    }

    for (const p of paths) {
      try {
        await fs.access(ospath.join(basePath, p));
      } catch (err) {
        console.log(chalk.yellow(`Warning: '${p}' directory not found`));
        continue;
      }
      if (!(await fs.stat(ospath.join(basePath, p))).isDirectory()) {
        throw new Error(`${p} is not a directory`);
      }
      result.push(p);
    }
    return result;
  };

  const newConfig = { ...config };
  for (const [key] of Object.entries(config)) {
    newConfig[key] = await checkDirAccess(targetPath, config[key]);
  }
  return newConfig;
}

export async function getRepoConfig(targetPath: string, validate: boolean): Promise<any> {
  let cfg = await getDefaultConfig(targetPath);

  /* Read config file */
  try {
    cfg = JSON.parse((await fs.readFile(ospath.join(targetPath, REPO_CONFIG_FILE))).toString());
  } catch (err) { /* */ }

  if (validate) {
    return await validateRepoConfig(targetPath, cfg);
  }
  return cfg;
}
