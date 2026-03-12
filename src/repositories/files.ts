import { FileServiceSettingsUpdate } from '@extrahorizon/javascript-sdk';
import { getSdk } from '../exh';

export async function updateFileServiceSettings(settings: Partial<FileServiceSettingsUpdate>) {
  return await getSdk().files.settings.update(settings);
}
