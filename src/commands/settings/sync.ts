import * as path from 'node:path';
import { Argv } from 'yargs';
import { epilogue } from '../../helpers/util';
import * as serviceSettingService from '../../services/settings';

export const command = 'sync';
export const desc = 'Synchronize Service Settings';
export const builder = (yargs: Argv) => epilogue(yargs).options({});

export const handler = async () => {
  const filePath = path.join(process.cwd(), 'service-settings.json');
  await serviceSettingService.sync(filePath);
};
