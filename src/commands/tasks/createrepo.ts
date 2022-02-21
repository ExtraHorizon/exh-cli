import * as chalk from 'chalk';
import { readFile, writeFile } from 'fs/promises';
import { exec } from 'child_process';
import { epilogue } from '../../helpers/util';

export const command = 'create-repo <name>';
export const desc = 'Create a new task repository';
export const builder = (yargs: any) => epilogue(yargs).positional('name', {
  demandOption: true,
  description: 'The name of the new repo/task',
  type: 'string',
}).options({
  repo: {
    description: 'repo template to clone',
    type: 'string',
    default: 'https://github.com/ExtraHorizon/template-task',
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
  const pkg = JSON.parse((await readFile(`${name}/package.json`)).toString());
  pkg.name = name;
  await writeFile(`${name}/package.json`, JSON.stringify(pkg, null, 4));
}

export const handler = async ({ name, repo }) => {
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

    console.log('Initializing git');
    /* Make clean repo & commit files */
    await asyncExec(`cd ${name} && rm -rf .git && git init . && git add . && git commit -m "First commit"`);
    console.log('Done! 🎉');
  } catch (err) {
    /* Clean up in case of error */
    await asyncExec(`rm -rf ${name}`);
    console.log(chalk.red('Failed to create repo'));
    console.log(err);
  }
};
