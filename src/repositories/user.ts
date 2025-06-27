import { OAuth1Client, RegisterUserData, rqlBuilder } from '@extrahorizon/javascript-sdk';

export async function findUserByEmail(sdk: OAuth1Client, email: string) {
  const rql = rqlBuilder().eq('email', email).build();
  return await sdk.users.findFirst({ rql });
}

export async function isEmailAvailable(sdk: OAuth1Client, email: string) {
  const { emailAvailable } = await sdk.users.isEmailAvailable(email);
  return emailAvailable;
}

export async function createUser(sdk: OAuth1Client, data: RegisterUserData) {
  return await sdk.users.createAccount(data);
}

export async function findGlobalRoleByName(sdk: OAuth1Client, name: string) {
  return await sdk.users.globalRoles.findByName(name);
}

export async function createGlobalRole(sdk: OAuth1Client, name: string, description: string) {
  return await sdk.users.globalRoles.create({ name, description });
}

export async function addPermissionsToGlobalRole(sdk: OAuth1Client, name: string, permissions: string[]) {
  return await sdk.users.globalRoles.addPermissions(
    rqlBuilder().eq('name', name).build(),
    { permissions }
  );
}

export async function removePermissionsFromGlobalRole(sdk: OAuth1Client, name: string, permissions: string[]) {
  return await sdk.users.globalRoles.removePermissions(
    rqlBuilder().eq('name', name).build(),
    { permissions }
  );
}

export async function addGlobalRoleToUser(sdk: OAuth1Client, userId: string, roleId: string) {
  return await sdk.users.globalRoles.addToUsers(
    rqlBuilder().eq('id', userId).build(),
    { roles: [roleId] }
  );
}
