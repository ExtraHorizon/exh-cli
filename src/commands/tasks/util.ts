import { createWriteStream, unlink } from 'fs';
import { tmpdir } from 'os';
import { createOAuth1Client, OAuth1Client } from '@extrahorizon/javascript-sdk';
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

  const email = (targetEmail || `exh.tasks+${taskName}@extrahorizon.com`).toLowerCase();
  validateEmail(email);

  // The password policy requires one number as well as one uppercase and lowercase letter
  const password = `0Oo-${uuidv4()}`;

  const roleName = `exh.tasks.${taskName}`;
  const role = await syncRoleWithPermissions(sdk, taskName, roleName, targetPermissions);

  // Create a user for the task if the user does not exist
  let user = await userRepository.findUserByEmail(sdk, email);

  console.group(chalk.white(`🔄  Syncing user: ${email}`));

  if (!user) {
    console.log(chalk.white('⚙️  Creating the user...'));

    user = await userRepository.createUser(sdk, {
      firstName: `${taskName}`,
      lastName: 'exh.tasks',
      email,
      password,
      phoneNumber: '0000000000',
      language: 'EN',
    });

    await assignRoleToUser(sdk, user.id, role.id);
    const oAuth1Tokens = await createOAuth1Tokens(sdk, email, password);

    console.groupEnd();
    console.log(chalk.green('✅  Successfully synced user'));
    console.log('');

    return oAuth1Tokens;
  }

  // Check if the there are existing user credentials in the Function's environment variables
  const currentFunction = await functionRepository.findByName(sdk, taskName);

  const hasExistingCredentials = (
    currentFunction?.environmentVariables?.API_HOST?.value &&
    currentFunction?.environmentVariables?.API_OAUTH_TOKEN_SECRET?.value &&
    currentFunction?.environmentVariables?.API_OAUTH_TOKEN?.value &&
    currentFunction?.environmentVariables?.API_OAUTH_CONSUMER_KEY?.value &&
    currentFunction?.environmentVariables?.API_OAUTH_CONSUMER_SECRET?.value
  );

  if (!hasExistingCredentials) {
    throw new Error('❌ The user for the task-config.json executionCredentials exists, but no credentials were found in the Function environmentVariables');
  }

  const taskUserSdk = createOAuth1Client({
    host: currentFunction.environmentVariables.API_HOST.value,
    tokenSecret: currentFunction.environmentVariables.API_OAUTH_TOKEN_SECRET.value,
    token: currentFunction.environmentVariables.API_OAUTH_TOKEN.value,
    consumerKey: currentFunction.environmentVariables.API_OAUTH_CONSUMER_KEY.value,
    consumerSecret: currentFunction.environmentVariables.API_OAUTH_CONSUMER_SECRET.value,
  });

  const taskUser = await taskUserSdk.users.me();
  if (taskUser.id !== user.id) {
    throw new Error(`❌  The credentials found in the Function (${taskUser.email}) do not match the user found for the task-config.json executionCredentials (${user.email})`);
  }

  console.log(chalk.white('⚙️  Reusing existing user credentials...'));

  // Ensure the role is assigned to the user
  const userRole = user.roles?.find(({ name }) => name === roleName);
  if (!userRole) {
    await assignRoleToUser(sdk, user.id, role.id);
  }

  console.groupEnd();
  console.log(chalk.green('✅  Successfully synced user'));

  console.log('');

  // Return the existing credentials
  return {
    token: currentFunction.environmentVariables.API_OAUTH_TOKEN.value,
    tokenSecret: currentFunction.environmentVariables.API_OAUTH_TOKEN_SECRET.value,
  };
}

async function syncRoleWithPermissions(sdk: OAuth1Client, taskName: string, roleName: string, targetPermissions: string[]) {
  console.group(chalk.white(`🔄  Syncing role: ${roleName}`));

  if (targetPermissions.length === 0) {
    console.log(chalk.yellow('⚠️  The executionCredentials.permissions field has no permissions defined'));
  }

  let role = await userRepository.findGlobalRoleByName(sdk, roleName);

  if (!role) {
    console.log(chalk.white('⚙️  Creating the role...'));

    // Create the role
    const roleDescription = `A role created by the CLI for the execution of the task ${taskName}`;
    role = await userRepository.createGlobalRole(sdk, roleName, roleDescription);

    // Throws a `Some fields have the wrong format` error if the permissions array is empty
    if (targetPermissions.length !== 0) {
      await userRepository.addPermissionsToGlobalRole(sdk, roleName, targetPermissions);
    }

    console.log(chalk.white(`🔐  Permissions added: [${targetPermissions.join(', ')}]`));
    console.groupEnd();
    console.log(chalk.green('✅  Successfully synced role'));
    console.log('');

    return role;
  }

  console.log(chalk.white('⚙️  Updating the role...'));

  // If the role exists, but the permissions do not match, update the role
  const currentPermissions = role.permissions?.flatMap(permission => permission.name) || [];
  const permissionsToAdd = targetPermissions.filter(targetPermission => !currentPermissions.includes(targetPermission));
  const permissionsToRemove = currentPermissions.filter(currentPermission => !targetPermissions.includes(currentPermission));

  if (permissionsToAdd.length > 0) {
    await userRepository.addPermissionsToGlobalRole(sdk, roleName, permissionsToAdd);
    console.log(chalk.white(`🔐  Permissions added: [${permissionsToAdd.join(',')}]`));
  }

  if (permissionsToRemove.length > 0) {
    await userRepository.removePermissionsFromGlobalRole(sdk, roleName, permissionsToRemove);
    console.log(chalk.white(`🔐  Permissions removed: [${permissionsToRemove.join(',')}]`));
  }

  console.groupEnd();
  console.log(chalk.green('✅  Successfully synced role'));
  console.log('');
  return role;
}

async function assignRoleToUser(sdk: OAuth1Client, userId: string, roleId: string) {
  console.log(chalk.white('⚙️  Assigning the role to the user...'));

  await userRepository.addGlobalRoleToUser(sdk, userId, roleId);
}

async function createOAuth1Tokens(sdk: OAuth1Client, email: string, password: string) {
  console.log(chalk.white('⚙️  Creating credentials...'));

  const response = await authRepository.createOAuth1Tokens(sdk, email, password);
  const { token, tokenSecret } = response;

  return { token, tokenSecret };
}

function validateEmail(email: string) {
  // Regex validation matching the user service
  const emailRegex = /.+@.+\..+/;

  if (email.length < 3 || email.length > 256 || !emailRegex.test(email)) {
    throw new Error('Invalid email address');
  }
}
