import { EmailTemplates } from '@extrahorizon/javascript-sdk';
import { blue, green, yellow } from 'chalk';
import { updateFileServiceSettings } from '../../repositories/files';
import * as templateV2Repository from '../../repositories/templatesV2';
import { updateEmailTemplates, updatePasswordPolicy, updateVerificationSettings } from '../../repositories/user';
import { readAndValidateServiceSettingsConfig, ServiceSettingsFile } from './util/readServiceSettingsFile';

export async function sync(path: string) {
  console.log(yellow(`Synchronizing Service Settings from ${path}`));

  const serviceSettings = await readAndValidateServiceSettingsConfig(path);

  await syncUserSettings(serviceSettings?.users);
  await syncFileServiceSettings(serviceSettings?.files);
}

async function syncUserSettings(settings?: ServiceSettingsFile['users']) {
  if (!settings) {
    return;
  }
  console.group(blue('Sync User Service Settings:'));
  await syncPasswordPolicy(settings.passwordPolicy);
  await syncEmailTemplates(settings.emailTemplates);
  await syncVerificationSettings(settings.verification);
  console.groupEnd();
}

async function syncFileServiceSettings(fileServiceSettings: ServiceSettingsFile['files']) {
  if (!fileServiceSettings) {
    return;
  }
  console.group(blue('Sync File Service Settings:'));
  await updateFileServiceSettings(fileServiceSettings);
  console.log(green('✓ Synced general file service settings'));
  console.groupEnd();
}

async function syncPasswordPolicy(passwordPolicy?: Partial<ServiceSettingsFile['users']['passwordPolicy']>) {
  if (!passwordPolicy) {
    return;
  }

  await updatePasswordPolicy(passwordPolicy);
  console.log(green('✓ Synced password policy'));
}

async function syncEmailTemplates(emailTemplateNames?: Partial<ServiceSettingsFile['users']['emailTemplates']>) {
  if (!emailTemplateNames) {
    return;
  }

  const emailTemplates = await convertEmailTemplateNamesToIds(emailTemplateNames);

  await updateEmailTemplates(emailTemplates);
  console.log(green('✓ Synced email templates'));
}

async function syncVerificationSettings(verificationSettings?: ServiceSettingsFile['users']['verification']) {
  if (!verificationSettings) {
    return;
  }

  await updateVerificationSettings(verificationSettings);
  console.log(green('✓ Synced verification settings'));
}

async function convertEmailTemplateNamesToIds(emailTemplateNames: Partial<ServiceSettingsFile['users']['emailTemplates']>) {
  const emailTemplates: Partial<EmailTemplates> = {};

  const templateNameIdMap = {
    activationEmailTemplateName: 'activationEmailTemplateId',
    reactivationEmailTemplateName: 'reactivationEmailTemplateId',
    passwordResetEmailTemplateName: 'passwordResetEmailTemplateId',
    oidcUnlinkEmailTemplateName: 'oidcUnlinkEmailTemplateId',
    oidcUnlinkPinEmailTemplateName: 'oidcUnlinkPinEmailTemplateId',
    activationPinEmailTemplateName: 'activationPinEmailTemplateId',
    reactivationPinEmailTemplateName: 'reactivationPinEmailTemplateId',
    passwordResetPinEmailTemplateName: 'passwordResetPinEmailTemplateId',
  };

  for (const [nameProperty, idProperty] of Object.entries(templateNameIdMap)) {
    if (emailTemplateNames[nameProperty]) {
      const template = await templateV2Repository.findByName(emailTemplateNames[nameProperty]);

      if (!template) {
        console.log(yellow(`⚠️  Template with name "${emailTemplateNames[nameProperty]}" not found. Skipping ${idProperty}.`));
        continue;
      }

      emailTemplates[idProperty] = template.id;
    }
  }

  return emailTemplates;
}
