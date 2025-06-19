import { createWriteStream, unlink } from 'fs';
import { tmpdir } from 'os';
import { OAuth1Client, rqlBuilder } from '@extrahorizon/javascript-sdk';
import * as archiver from 'archiver';
import * as chalk from 'chalk';
import { v4 as uuidv4 } from 'uuid';
import * as authRepository from '../../repositories/auth';
import * as functionRepository from '../../repositories/functions';
import * as userRepository from '../../repositories/user';

export async function zipFileFromDirectory(path: string): Promise<string> {
  return new Promise((res, rej) => {
    /* Create a temporary file */
    const tmpPath = `${tmpdir()}/${uuidv4()}`;
    const output = createWriteStream(tmpPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Sets the compression level.
    });

    output.on('close', () => {
      res(tmpPath);
    });
    archive.on('error', (err: any) => {
      unlink(tmpPath, msg => { console.log(msg); });
      rej(err);
    });

    archive.pipe(output);
    archive.directory(`${path}/`, false);
    archive.finalize();
  });
}

export async function syncFunctionUser(sdk: OAuth1Client, data: { taskName: string; targetEmail?: string; targetPermissions: string[]; }) {
  const { taskName, targetEmail, targetPermissions } = data;

  const email = targetEmail || `exh.tasks+${taskName}@extrahorizon.com`;
  validateEmail(email);

  // The password policy requires one number as well as one uppercase and lowercase letter
  const password = `0Oo-${uuidv4()}`;

  const roleName = `exh.tasks.${taskName}`;
  const role = await syncRoleWithPermissions(sdk, taskName, roleName, targetPermissions);

  // Create a user for the task if the user does not exist
  let user = await userRepository.findUserByEmail(sdk, email);

  if (!user) {
    console.log(chalk.white('⚙️  Creating a user for the task'));

    const { emailAvailable } = await sdk.users.isEmailAvailable(email);
    if (!emailAvailable) {
      throw new Error('❌ The user could not be created as the email address is already in use');
    }

    user = await sdk.users.createAccount({
      firstName: `${taskName}`,
      lastName: 'exh.tasks',
      email,
      password,
      phoneNumber: '0000000000',
      language: 'EN',
    });

    console.log(chalk.green('✅ Successfully created a user for task'));

    await assignRoleToUser(sdk, user.id, role.id);
    return await createOAuth1Tokens(sdk, email, password);
  }

  // Check if the there are existing user credentials in the Function's environment variables
  console.log(chalk.white('⚙️  Checking for the existing users credentials'));

  const currentFunction = await functionRepository.findByName(sdk, taskName);

  const hasExistingCredentials = (
    currentFunction?.environmentVariables?.API_HOST?.value &&
    currentFunction?.environmentVariables?.API_OAUTH_TOKEN_SECRET?.value &&
    currentFunction?.environmentVariables?.API_OAUTH_TOKEN?.value &&
    currentFunction?.environmentVariables?.API_OAUTH_CONSUMER_KEY?.value &&
    currentFunction?.environmentVariables?.API_OAUTH_CONSUMER_SECRET?.value
  );

  // If there are no existing credentials, remove the user and create a new one
  if (!hasExistingCredentials) {
    throw new Error('❌ No credentials were found for the existing user');
  }

  // Ensure the role is assigned to the user
  const userRole = user.roles.find(({ name }) => name === roleName);
  if (!userRole) {
    await assignRoleToUser(sdk, user.id, role.id);
  }

  // Return the existing credentials
  console.log(chalk.green('✅ Using existing credentials for the user'));

  return {
    token: currentFunction.environmentVariables.API_OAUTH_TOKEN.value,
    tokenSecret: currentFunction.environmentVariables.API_OAUTH_TOKEN_SECRET.value,
  };
}

async function syncRoleWithPermissions(sdk: OAuth1Client, taskName: string, roleName: string, targetPermissions: string[]) {
  console.log(chalk.white('⚙️  Checking if the role exists'));
  let role = await sdk.users.globalRoles.findByName(roleName);

  if (!role) {
    console.log(chalk.white('⚙️  Role does not exist, creating a new role'));

    // Create the role
    role = await sdk.users.globalRoles.create({
      name: roleName,
      description: `A role created by the CLI for the execution of the task ${taskName}`,
    });

    // Assign permissions to the role
    console.log(chalk.white('⚙️  Assigning permissions to the role'));

    await sdk.users.globalRoles.addPermissions(
      rqlBuilder().eq('name', roleName).build(),
      { permissions: targetPermissions }
    );

    console.log(chalk.green('✅ Successfully assigned permissions to the role'));
    return role;
  }

  // If the role exists, but the permissions do not match, update the role
  const currentPermissions = role.permissions?.flatMap(permission => permission.name) || [];
  const permissionsToAdd = targetPermissions.filter(targetPermission => !currentPermissions.includes(targetPermission));
  const permissionsToRemove = currentPermissions.filter(currentPermission => !targetPermissions.includes(currentPermission));

  if (permissionsToAdd.length > 0) {
    console.log(chalk.white('⚙️  Adding missing permissions to the role'));

    await sdk.users.globalRoles.addPermissions(rqlBuilder().eq('name', roleName).build(), { permissions: permissionsToAdd });

    console.log(chalk.green('✅ Successfully added missing permissions to the role'));
  }

  if (permissionsToRemove.length > 0) {
    console.log(chalk.white('⚙️  Removing excess permissions from the role'));

    await sdk.users.globalRoles.removePermissions(rqlBuilder().eq('name', roleName).build(), { permissions: permissionsToRemove });

    console.log(chalk.green('✅ Successfully removed excess permissions from the role'));
  }

  return role;
}

async function assignRoleToUser(sdk: OAuth1Client, userId: string, roleId: string) {
  console.log(chalk.white('⚙️  Assigning the role to the user'));

  await sdk.users.globalRoles.addToUsers(
    rqlBuilder().eq('id', userId).build(),
    { roles: [roleId] }
  );

  console.log(chalk.green('✅ Successfully assigned the role to the user'));
}

function validateEmail(email: string) {
  // Regex validation matching the user service
  const emailRegex = /.+@.+\..+/;

  if (email.length < 3 || email.length > 256 || !emailRegex.test(email)) {
    throw new Error('Invalid email address');
  }
}

async function createOAuth1Tokens(sdk: OAuth1Client, email: string, password: string) {
  console.log(chalk.white('⚙️  Creating OAuth1 tokens for the user', email));

  const response = await authRepository.createOAuth1Tokens(sdk, email, password);
  const { token, tokenSecret } = response.data;

  console.log(chalk.green('✅ Successfully created OAuth1 tokens for the user', email));

  return { token, tokenSecret };
}
