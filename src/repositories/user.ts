import { EmailTemplates, PasswordPolicy, RegisterUserData, rqlBuilder } from '@extrahorizon/javascript-sdk';
import { getSdk } from '../exh';

export async function findUserByEmail(email: string) {
  const rql = rqlBuilder().eq('email', email).build();
  return await getSdk().users.findFirst({ rql });
}

export async function isEmailAvailable(email: string) {
  const { emailAvailable } = await getSdk().users.isEmailAvailable(email);
  return emailAvailable;
}

export async function createUser(data: RegisterUserData) {
  return await getSdk().users.createAccount(data);
}

export async function findGlobalRoleByName(name: string) {
  return await getSdk().users.globalRoles.findByName(name);
}

export async function createGlobalRole(name: string, description: string) {
  return await getSdk().users.globalRoles.create({ name, description });
}

export async function addPermissionsToGlobalRole(name: string, permissions: string[]) {
  return await getSdk().users.globalRoles.addPermissions(
    rqlBuilder().eq('name', name).build(),
    { permissions }
  );
}

export async function removePermissionsFromGlobalRole(name: string, permissions: string[]) {
  return await getSdk().users.globalRoles.removePermissions(
    rqlBuilder().eq('name', name).build(),
    { permissions }
  );
}

export async function addGlobalRoleToUser(userId: string, roleId: string) {
  return await getSdk().users.globalRoles.addToUsers(
    rqlBuilder().eq('id', userId).build(),
    { roles: [roleId] }
  );
}

// TODO: replace with VerificationSettings type when it's exported from the SDK
export async function updateVerificationSettings(settings: Record<string, string>) {
  return await getSdk().users.settings.updateVerificationSettings(settings);
}

export async function updateEmailTemplates(emailTemplates: Partial<EmailTemplates>) {
  return await getSdk().users.setEmailTemplates(emailTemplates);
}

export async function updatePasswordPolicy(passwordPolicy: Partial<PasswordPolicy>) {
  // @ts-expect-error - TODO: the SDK should allow partial updates for password policy, but currently requires all fields to be set
  return await getSdk().users.updatePasswordPolicy(passwordPolicy);
}
