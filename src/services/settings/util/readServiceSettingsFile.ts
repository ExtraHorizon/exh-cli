import { readFile } from 'fs/promises';
import { FileServiceSettingsUpdate, PasswordPolicy, VerificationSettings } from '@extrahorizon/javascript-sdk';
import * as serviceSettingsSchema from '../../../config-json-schemas/SettingsConfig.json';
import { ajvValidate } from '../../../helpers/util';

export interface ServiceSettingsFile {
  users?: {
    passwordPolicy?: Partial<PasswordPolicy>;
    verification?: Partial<Pick<VerificationSettings, 'enablePinCodeActivationRequests' | 'enablePinCodeForgotPasswordRequests'>>;
    emailTemplates?: Partial<{
      activationEmailTemplateName?: string;
      reactivationEmailTemplateName?: string;
      passwordResetEmailTemplateName?: string;
      oidcUnlinkEmailTemplateName?: string;
      oidcUnlinkPinEmailTemplateName?: string;
      activationPinEmailTemplateName?: string;
      reactivationPinEmailTemplateName?: string;
      passwordResetPinEmailTemplateName?: string;
    }>;
  };
  files?: FileServiceSettingsUpdate;
}

export async function readAndValidateServiceSettingsConfig(path: string) {
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
