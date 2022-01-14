import * as yargs from 'yargs';
import * as chalk from 'chalk';
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
      console.log(chalk.red(err.stack));
    } else {
      console.log(chalk.red(msg));
    }
    console.log('\nUsage:');
    console.log(argv.help());
    process.exit(1);
  });
}
