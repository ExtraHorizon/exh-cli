import * as yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { sdkMock } from '../__mocks__/@extrahorizon/javascript-sdk';

const mockSdk = sdkMock;
jest.spyOn(mockSdk.raw, 'get').mockImplementation(() => ({
  data: {
    data: [{
      description: 'this is a description',
      name: 'hello',
      updateTimestamp: new Date('2023-09-07T09:27:54.897Z'),
    }],
  },
}));

/* eslint-disable @typescript-eslint/no-floating-promises */
// @ts-expect-error
yargs(hideBin(process.argv)).middleware(async argv => {
  return { sdk: mockSdk, isTTY: true };
}).commandDir('../src/commands', {
  extensions: ['js', 'ts'],
})
  .scriptName('exh')
  .strict()
  .demandCommand(1)
  .completion('generate_completion', false)
  .parse();

