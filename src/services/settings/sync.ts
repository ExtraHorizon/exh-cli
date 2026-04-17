import { FileServiceSettingsUpdate } from '@extrahorizon/javascript-sdk';
import { blue, green, yellow } from 'chalk';
import { updateFileServiceSettings } from '../../repositories/files';
import * as templateV2Repository from '../../repositories/templatesV2';
import { updateEmailTemplates, updatePasswordPolicy, updateVerificationSettings } from '../../repositories/user';
import { EmailTemplateSettings, PasswordPolicySettings, readAndValidateServiceSettingsConfig, ServiceSettingsFile, UserServiceSettings } from './util/readServiceSettingsFile';

export async function sync(path: string) {
  console.log(yellow('Syncing service settings'));

  const serviceSettings = await readAndValidateServiceSettingsConfig(path);

  await syncUserSettings(serviceSettings?.users);
  await syncFileServiceSettings(serviceSettings?.files);
  console.log(green('✓ Synced service settings'));
}

async function syncUserSettings(userServiceSettings?: UserServiceSettings) {
  if (!userServiceSettings || Object.keys(userServiceSettings).length === 0) {
    return;
  }
  console.group(blue('Syncing user service settings:'));
  await syncPasswordPolicy(userServiceSettings.passwordPolicy);
  await syncEmailTemplates(userServiceSettings.emailTemplates);
  await syncVerificationSettings(userServiceSettings.verification);
  console.groupEnd();
  console.log(green('✓ Synced user service settings'));
}

async function syncFileServiceSettings(fileServiceSettings?: FileServiceSettingsUpdate) {
  if (!fileServiceSettings || Object.keys(fileServiceSettings).length === 0) {
    return;
  }
  console.group(blue('Syncing file service Settings:'));
  await updateFileServiceSettings(fileServiceSettings);
  console.groupEnd();
  console.log(green('✓ Synced file service settings'));
}

async function syncPasswordPolicy(passwordPolicy?: PasswordPolicySettings) {
  if (!passwordPolicy || Object.keys(passwordPolicy).length === 0) {
    return;
  }

  console.log(blue('Syncing password policy'));
  await updatePasswordPolicy(passwordPolicy);
  console.log(green('✓ Synced password policy'));
}

async function syncEmailTemplates(emailTemplates?: EmailTemplateSettings) {
  if (!emailTemplates || Object.keys(emailTemplates).length < 1) {
    return;
  }

  for (const name of Object.values(emailTemplates)) {
    const template = await templateV2Repository.findByName(name);

    if (!template) {
      throw new Error(`❌  Template with name "${name}" not found.`);
    }
  }

  console.log(blue('Syncing email templates'));
  await updateEmailTemplates(emailTemplates);
  console.log(green('✓ Synced email templates'));
}

async function syncVerificationSettings(verificationSettings?: ServiceSettingsFile['users']['verification']) {
  if (!verificationSettings || Object.keys(verificationSettings).length === 0) {
    return;
  }

  console.log(blue('Syncing verification settings'));
  await updateVerificationSettings(verificationSettings);
  console.log(green('✓ Synced verification settings'));
}
