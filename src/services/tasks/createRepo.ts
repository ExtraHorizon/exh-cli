import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import * as chalk from 'chalk';
import { asyncExec, getSwaggerDocumentationUrl } from '../../helpers/util';

export async function createRepo({ name, repo, git, path }) {
  /*
    0. Check if git is installed.
    1. Clone template task repo
    2. Change task name in package.json
    3. Remove git remote
  */
  try {
    await asyncExec('git --version');
  } catch (err) {
    console.log(chalk.red('Git is not installed. Please install git first.'));
  }

  console.log(`Creating new repo ${chalk.green(name)}...`);
  try {
    const repoPath = join(path || '', name);

    await asyncExec(`git clone ${repo} ${repoPath}`);
    /* Try to adjust package name. If this fails, no problem. Could be a non-js repo */
    try {
      await changePackageFile(repoPath, name);
    } catch (err) { /* empty */ }

    await asyncExec(`cd ${repoPath} && rm -rf .git`);
    if (git) {
      console.log('Initializing git');
      /* Make clean repo & commit files */
      await asyncExec(`cd ${repoPath} && git init . && git add . && git commit -m "First commit"`);
    }
    console.log('Done! 🎉');
  } catch (err) {
    console.log(chalk.red('Failed to create repo'));
    console.log(err);
  }
}

async function changePackageFile(repoPath: string, name: string) {
  try {
    const pkg = JSON.parse((await readFile(`${repoPath}/package.json`)).toString());
    pkg.name = name;
    await writeFile(`${repoPath}/package.json`, JSON.stringify(pkg, null, 2));
  } catch (err) {
    console.log('WARN: package.json not found. (possibly not a javascript repository');
  }

  try {
    const taskConfig = JSON.parse((await readFile(`${repoPath}/task-config.json`)).toString());
    taskConfig.$schema = getSwaggerDocumentationUrl('config-json-schemas/TaskConfig.json');
    taskConfig.name = name;
    taskConfig.description = `${name} task`;
    await writeFile(`${repoPath}/task-config.json`, JSON.stringify(taskConfig, null, 2));
  } catch (err) { /* */ }
}
