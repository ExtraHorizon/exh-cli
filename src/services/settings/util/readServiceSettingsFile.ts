import { readFile } from 'fs/promises';
import { FileServiceSettingsUpdate, PasswordPolicy } from '@extrahorizon/javascript-sdk';
import * as serviceSettingsSchema from '../../../config-json-schemas/SettingsConfig.json';
import { ajvValidate } from '../../../helpers/util';

export interface ServiceSettingsFile {
  users: {
    passwordPolicy: Partial<PasswordPolicy>;
    verification: Record<string, string>; // TODO: replace with VerificationSettings type when it's exported from the SDK
    emailTemplates: Partial<{
      activationEmailTemplateName: string;
      reactivationEmailTemplateName: string;
      passwordResetEmailTemplateName: string;
      oidcUnlinkEmailTemplateName: string;
      oidcUnlinkPinEmailTemplateName: string;
      activationPinEmailTemplateName: string;
      reactivationPinEmailTemplateName: string;
      passwordResetPinEmailTemplateName: string;
    }>;
  };
  files: FileServiceSettingsUpdate;
}
export async function readAndValidateDispatcherConfig(path: string) {
  let config: any;
  try {
    const buffer = await readFile(path);
    config = JSON.parse(buffer.toString());
  } catch (error) {
    throw new Error(`Failed to read Service Settings from ${path}: ${error.message}`);
  }

  ajvValidate<ServiceSettingsFile>(serviceSettingsSchema, config);

  return config;
}
