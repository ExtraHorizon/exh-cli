import { Argv } from 'yargs';
import { epilogue } from '../../helpers/util';
import * as serviceSettingService from '../../services/settings';

export const command = 'sync';
export const desc = 'Synchronize Service Settings';
export const builder = (yargs: Argv) => epilogue(yargs).options({
  file: {
    demandOption: false,
    describe: 'Path to the file containing the Service Settings configuration',
    type: 'string',
    default: './service-settings.json',
  },
});

export const handler = async ({ file }: { file: string; }) => {
  await serviceSettingService.sync(file);
};
