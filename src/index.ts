#! /usr/bin/env node

import * as yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { UpdateNotifier } from 'update-notifier';
import * as tty from 'tty';
import ExH from './exh';

function checkForNewVersion() {
  const pkg = require('../package.json'); // eslint-disable-line @typescript-eslint/no-var-requires
  const notifier = new UpdateNotifier({
    pkg,
    updateCheckInterval: 0,
  });
  notifier.notify();
}

checkForNewVersion();

/* eslint-disable @typescript-eslint/no-floating-promises */
yargs(hideBin(process.argv)).middleware(async argv => {
  /* Check if output is tty or not */
  let isTTY = true;
  if (!tty.isatty(process.stdout.fd)) {
    isTTY = false;
  }

  if (argv.email && argv.password) {
    /* Login command, don't authenticate with sdk */
    return { isTTY };
  }

  /* Inject sdk authentication into every command */
  if (process.env.NO_SDK) {
    return { sdk: 'no-sdk', isTTY };
  }

  const sdk = await ExH();
  return { sdk, isTTY };
}).commandDir('commands')
  .strict()
  .demandCommand(1)
  .parse();
