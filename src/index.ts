#! /usr/bin/env node

import * as yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { UpdateNotifier } from 'update-notifier';
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
  /* Inject sdk authentication into every command */
  if (process.env.NO_SDK) {
    return { sdk: 'no-sdk' };
  }
  try {
    const sdk = await ExH();
    return { sdk };
  } catch (err) {
    throw new Error('Failed to get credentials. Make sure they are specified in ~/.exh/credentials');
  }
}).commandDir('commands')
  .strict()
  .demandCommand(1)
  .parse();
