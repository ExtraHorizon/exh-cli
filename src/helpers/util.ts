import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import Ajv from 'ajv';
import * as chalk from 'chalk';
import * as yargs from 'yargs';
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

// Return a string like: https://swagger.extrahorizon.com/cli/${cliVersion}/${subPath}
export function getSwaggerDocumentationUrl(subPath: string) {
  const packageJsonPath = path.join(__dirname, '../../package.json');
  const packageJsonString = fs.readFileSync(packageJsonPath, 'utf-8');

  // Might be `1.10.0` or something like `1.10.0-dev-108-6b89c8f` or `1.10.0-feature-108-6b89c8f`
  const packageVersion = JSON.parse(packageJsonString).version;

  // If it is a stable version we want to return `1.10.0`
  if (packageVersion.match(/^\d+\.\d+\.\d+$/)) {
    return `https://swagger.extrahorizon.com/cli/${packageVersion}/${subPath}`;
  }

  // If it is not a stable version, we always return `${version}-dev`
  // As determined by the "Publish the json-schemas of the configuration files" GitHub Action step
  if (packageVersion.match(/^\d+\.\d+\.\d+-.*$/)) {
    const versionParts = packageVersion.split('-');
    return `https://swagger.extrahorizon.com/cli/${versionParts[0]}-dev/${subPath}`;
  }

  throw new Error(`Unknown CLI version format: ${packageVersion}`);
}

export function ajvValidate<T>(schema: any, data: any): asserts data is T {
  const validate = new Ajv().compile(schema);
  const valid = validate(data);
  if (!valid) {
    const errors = getAjvErrorStrings(validate.errors);
    throw new Error(errors[0] || 'Unknown config validation error');
  }
}

export function getAjvErrorStrings(errors: any[]) {
  return errors.map(error => {
    let message = '';

    if (error.instancePath) {
      const normalizedPath = error.instancePath
        .replace(/^\//, '') // remove leading slash
        .replace(/\//g, '.'); // replace slashes with dots
      message += `"${normalizedPath}" `;
    }

    message += error.message || 'has an unknown error';

    // 'type' and 'required' have clear enough messages, so we don't need to add params
    if (!['type', 'required'].includes(error.keyword) && error.params) {
      message += ` ${JSON.stringify(error.params)}`;
    }

    return message;
  });
}
