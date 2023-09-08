#! /usr/bin/env node

import * as tty from 'tty';
import * as yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { sdkAuth, sdkInitOnly } from './exh';

function checkVersion() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pkg = require('../package.json');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const updateNotifier = require('update-notifier');
  const notifier = updateNotifier({ pkg, updateCheckInterval: 0 });

  notifier.notify();
}

checkVersion();

/* eslint-disable @typescript-eslint/no-floating-promises */
yargs(hideBin(process.argv)).middleware(async argv => {
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
}).commandDir('commands', {
  extensions: ['js', 'ts'],
})
  .scriptName('exh')
  .strict()
  .demandCommand(1)
  .completion('generate_completion', false)
  .parse();
