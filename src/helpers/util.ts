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

interface ExHCredentials {
  API_HOST: string;
  API_OAUTH_CONSUMER_KEY: string;
  API_OAUTH_CONSUMER_SECRET: string;
  API_OAUTH_TOKEN: string;
  API_OAUTH_TOKEN_SECRET: string;
}

export function extractLocalCredentials() {
  let credentials: ExHCredentials;
  let errorMessage = '';

  try {
    const credentialsFile = fs.readFileSync(EXH_CONFIG_FILE, 'utf-8');
    const credentialFileLines = credentialsFile.split(/\r?\n/);

    for (const credentialFileLine of credentialFileLines) {
      const [key, value] = credentialFileLine.split('=');

      if (key && value) {
        credentials[key.trim()] = value.trim();
      }
    }

    // Set the credentials as environment variables if they're not present already
    for (const key of Object.keys(credentials)) {
      if (!process.env[key]) {
        process.env[key] = credentials[key];
      }
    }
  } catch (e) {
    errorMessage += 'Couldn\'t open ~/.exh/credentials. ';
  }

  const requiredEnvironmentVariables = ['API_HOST', 'API_OAUTH_CONSUMER_KEY', 'API_OAUTH_CONSUMER_SECRET', 'API_OAUTH_TOKEN', 'API_OAUTH_TOKEN_SECRET'];
  const missingEnvironmentVariables = requiredEnvironmentVariables.filter(key => !process.env[key]);

  if (missingEnvironmentVariables.length > 0) {
    errorMessage += `Missing environment variables: ${missingEnvironmentVariables.join(',')}`;
  }

  if (errorMessage) {
    throw new Error(`Failed to retrieve all credentials. ${errorMessage}`);
  }

  return credentials;
}
