import { RegisterUserData, rqlBuilder } from '@extrahorizon/javascript-sdk';
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
