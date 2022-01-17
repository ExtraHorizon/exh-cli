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
yargs(hideBin(process.argv)).middleware(async () => {
  /* Check if output is tty or not */
  let isTTY = true;
  if (!tty.isatty(process.stdout.fd)) {
    isTTY = false;
  }

  /* Inject sdk authentication into every command */
  if (process.env.NO_SDK) {
    return { sdk: 'no-sdk', isTTY };
  }
  try {
    const sdk = await ExH();
    return { sdk, isTTY };
  } catch (err) {
    throw new Error('Failed to get credentials. Make sure they are specified in ~/.exh/credentials');
  }
}).commandDir('commands')
  .strict()
  .demandCommand(1)
  .parse();
