import { readFile } from 'fs/promises';
import { FileServiceSettingsUpdate } from '@extrahorizon/javascript-sdk';
import * as serviceSettingsSchema from '../../../config-json-schemas/ServiceSettings.json';
import { ajvValidate } from '../../../helpers/util';

export interface PasswordPolicySettings {
  minimumLength?: number;
  maximumLength?: number;
  upperCaseRequired?: boolean;
  lowerCaseRequired?: boolean;
  symbolRequired?: boolean;
  numberRequired?: boolean;
}

export interface VerificationSettings {
  enablePinCodeActivationRequests?: boolean;
  enablePinCodeForgotPasswordRequests?: boolean;
}

export interface EmailTemplateSettings {
  activationEmailTemplateName?: string;
  reactivationEmailTemplateName?: string;
  passwordResetEmailTemplateName?: string;
  oidcUnlinkEmailTemplateName?: string;
  oidcUnlinkPinEmailTemplateName?: string;
  activationPinEmailTemplateName?: string;
  reactivationPinEmailTemplateName?: string;
  passwordResetPinEmailTemplateName?: string;
}

export interface UserServiceSettings {
  passwordPolicy?: PasswordPolicySettings;
  verification?: VerificationSettings;
  emailTemplates?: EmailTemplateSettings;
}

export interface ServiceSettingsFile {
  users?: UserServiceSettings;
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
