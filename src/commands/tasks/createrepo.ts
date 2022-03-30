import { exec } from 'child_process';
import { readFile, writeFile } from 'fs/promises';
import * as chalk from 'chalk';
import { epilogue } from '../../helpers/util';

export const command = 'create-repo <name>';
export const desc = 'Create a new task repository';
export const builder = (yargs: any) => epilogue(yargs).positional('name', {
  demandOption: true,
  description: 'The name of the new repo/task',
  type: 'string',
}).options({
  repo: {
    description: 'repository template to clone',
    type: 'string',
    default: 'https://github.com/ExtraHorizon/template-task',
  },
  git: {
    description: 'also initializes the cloned repository as a fresh git repository',
    type: 'boolean',
    default: false,
  },
});

async function asyncExec(cmd: string):Promise<string> {
  return new Promise((res, rej) => {
    exec(cmd, (err, stdout) => {
      if (err) {
        rej(err);
        return;
      }
      res(stdout);
    });
  });
}

async function changePackageFile(name: string) {
  try {
    const pkg = JSON.parse((await readFile(`${name}/package.json`)).toString());
    pkg.name = name;
    await writeFile(`${name}/package.json`, JSON.stringify(pkg, null, 4));
  } catch (err) {
    console.log('WARN: package.json not found. (possibly not a javascript repository');
  }

  try {
    const taskConfig = JSON.parse((await readFile(`${name}/task-config.json`)).toString());
    taskConfig.name = name;
    taskConfig.description = `${name} task`;
    await writeFile(`${name}/task-config.json`, JSON.stringify(taskConfig, null, 4));
  } catch (err) { /* */ }
}

export const handler = async ({ name, repo, git }) => {
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
    await asyncExec(`git clone ${repo} ${name}`);
    /* Try to adjust package name. If this fails, no problem. Could be a non-js repo */
    try {
      await changePackageFile(name);
    } catch (err) { /* empty */ }

    await asyncExec(`cd ${name} && rm -rf .git`);
    if (git) {
      console.log('Initializing git');
      /* Make clean repo & commit files */
      await asyncExec(`cd ${name} && git init . && git add . && git commit -m "First commit"`);
    }
    console.log('Done! 🎉');
  } catch (err) {
    /* Clean up in case of error */
    await asyncExec(`rm -rf ${name}`);
    console.log(chalk.red('Failed to create repo'));
    console.log(err);
  }
};
