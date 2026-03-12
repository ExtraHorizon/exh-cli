#! /usr/bin/env node

import * as tty from 'tty';
import { isEqual } from 'lodash';
import * as yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { sdkAuth } from './exh';

/* eslint-disable @typescript-eslint/no-floating-promises */
yargs(hideBin(process.argv))
  .middleware(async argv => {
    /* Check if output is tty or not */
    const isTTY = tty.isatty(process.stdout.fd);

    if (
      isEqual(argv._, ['login']) ||
      isEqual(argv._, ['data', 'schemas', 'init']) ||
      isEqual(argv._, ['data', 'schemas', 'verify']) ||
      isEqual(argv._, ['dispatchers', 'init']) ||
      isEqual(argv._, ['tasks', 'init']) ||
      isEqual(argv._, ['tasks', 'create-repo']) ||
      isEqual(argv._, ['templates', 'init']) ||
      isEqual(argv._, ['completion']) ||
      isEqual(argv._, ['generate_completion']) ||
      process.env.NO_SDK
    ) {
      return { isTTY } as any;
    }

    await sdkAuth();
    return { isTTY };
  })
  .commandDir('commands')
  .scriptName('exh')
  .strict()
  .demandCommand(1)
  .completion('generate_completion', false)
  .parse();
