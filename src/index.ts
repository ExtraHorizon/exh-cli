#! /usr/bin/env node

import * as tty from 'tty';
import * as yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { sdkAuth, sdkInitOnly } from './exh';
// import { OAuth1Client } from '@extrahorizon/javascript-sdk';

// function a(sdk: OAuth1Client) {
//   sdk.data.statuses.create()
// }

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
}).commandDir('commands')
  .strict()
  .demandCommand(1)
  .completion('generate_completion', false)
  .parse();
