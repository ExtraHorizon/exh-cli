import { exec } from 'child_process';
import * as fs from 'fs';
import * as chalk from 'chalk';
import * as yargs from 'yargs';
import { EXH_CONFIG_FILE } from '../constants';
import { CommandError } from './error';

/* Alas, global epilogues are not supported yet in yargs */
export function epilogue(y: yargs.Argv): yargs.Argv {
  return y.epilogue('Visit https://docs.extrahorizon.com/extrahorizon-cli/ for more information.').fail((msg, err, argv) => {
    if (err && err instanceof CommandError) {
      console.log(err.message);
      process.exit(1);
    }
    if (err) {
      console.log(chalk.red(err.message));
    } else {
      console.log(chalk.red(msg));
    }
    console.log('\nUsage:');
    console.log(argv.help());
    process.exit(1);
  });
}

export async function asyncExec(cmd: string): Promise<string> {
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

export function loadAndAssertCredentials() {
  const credentials = {};
  let credentialsFile: string;
  let errorMessage = '';

  try {
    credentialsFile = fs.readFileSync(EXH_CONFIG_FILE, 'utf-8');
  } catch (e) {
    errorMessage += 'Couldn\'t open ~/.exh/credentials. ';
  }

  const credentialFileLines = credentialsFile.split(/\r?\n/);
  for (const credentialFileLine of credentialFileLines) {
    const [key, value] = credentialFileLine.split('=');

    if (key && value) {
      credentials[key.trim()] = value.trim();
    }
  }

  const requiredEnvVariables = ['API_HOST', 'API_OAUTH_CONSUMER_KEY', 'API_OAUTH_CONSUMER_SECRET', 'API_OAUTH_TOKEN', 'API_OAUTH_TOKEN_SECRET'];
  for (const key of requiredEnvVariables) {
    // Set the environment variable if it's present in the credentials file, but not in the environment variables
    if (credentials[key] && !process.env[key]) {
      process.env[key] = credentials[key];
    }
  }

  const missingEnvironmentVariables = requiredEnvVariables.filter(key => !process.env[key]);
  if (missingEnvironmentVariables.length > 0) {
    errorMessage += `Missing environment variables: ${missingEnvironmentVariables.join(',')}`;
    throw new Error(`Failed to retrieve all credentials. ${errorMessage}`);
  }
}
