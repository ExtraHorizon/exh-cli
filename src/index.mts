#! /usr/bin/env node

import * as tty from 'tty';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { commands } from './commands/index.mjs';
import { sdkAuth, sdkInitOnly } from './exh.mjs';

await yargs(hideBin(process.argv)).middleware(async argv => {
  /* Check if output is tty or not */
  let isTTY = true;
  if (!tty.isatty(process.stdout.fd)) {
    isTTY = false;
  }

  if (argv.host && argv.consumerKey && argv.consumerSecret) {
    const sdk = await sdkInitOnly(argv.host as string, argv.consumerKey as string, argv.consumerSecret as string);
    /* Login command, don't authenticate with sdk */
    return { sdk, isTTY } as any;
  }

  /* Inject sdk authentication into every command */
  if (process.env.NO_SDK) {
    return { sdk: 'no-sdk', isTTY } as any;
  }

  const sdk = await sdkAuth();
  return { sdk, isTTY };
}).command(commands as any) /* Need to type this as any because yargs type definition is wrong (doesn't seem to have array overload) */
  .strict()
  .demandCommand(1)
  .completion('generate_completion', false)
  .parse();
