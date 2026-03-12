import { EmailTemplates } from '@extrahorizon/javascript-sdk';
import { blue, green, yellow } from 'chalk';
import { updateFileServiceSettings } from '../../repositories/files';
import * as templateV2Repository from '../../repositories/templatesV2';
import { updateEmailTemplates, updatePasswordPolicy, updateVerificationSettings } from '../../repositories/user';
import { readAndValidateServiceSettingsConfig, ServiceSettingsFile } from './util/readServiceSettingsFile';

export async function sync(path: string) {
  console.log(yellow('Syncing service settings'));

  const serviceSettings = await readAndValidateServiceSettingsConfig(path);

  await syncUserSettings(serviceSettings?.users);
  await syncFileServiceSettings(serviceSettings?.files);
  console.log(green('✓ Synced service settings'));
}

async function syncUserSettings(userServiceSettings?: ServiceSettingsFile['users']) {
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

async function syncFileServiceSettings(fileServiceSettings?: ServiceSettingsFile['files']) {
  if (!fileServiceSettings || Object.keys(fileServiceSettings).length === 0) {
    return;
  }
  console.group(blue('Syncing file service Settings:'));
  await updateFileServiceSettings(fileServiceSettings);
  console.groupEnd();
  console.log(green('✓ Synced file service settings'));
}

async function syncPasswordPolicy(passwordPolicy?: ServiceSettingsFile['users']['passwordPolicy']) {
  if (!passwordPolicy || Object.keys(passwordPolicy).length === 0) {
    return;
  }

  console.log(blue('Syncing password policy'));
  await updatePasswordPolicy(passwordPolicy);
  console.log(green('✓ Synced password policy'));
}

async function syncEmailTemplates(emailTemplateNames?: ServiceSettingsFile['users']['emailTemplates']) {
  if (!emailTemplateNames || Object.keys(emailTemplateNames).length === 0) {
    return;
  }

  const emailTemplates = await convertEmailTemplateNamesToIds(emailTemplateNames);

  if (Object.keys(emailTemplates).length === 0) {
    return;
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

async function convertEmailTemplateNamesToIds(emailTemplateNames: ServiceSettingsFile['users']['emailTemplates']) {
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
