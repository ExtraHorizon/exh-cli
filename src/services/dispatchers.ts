import { readFile } from 'fs/promises';
import { Dispatcher, DispatcherCreation, OAuth1Client } from '@extrahorizon/javascript-sdk';
import { blue, green, yellow } from 'chalk';
import * as dispatcherRepository from '../repositories/dispatchers';

export async function sync(sdk: OAuth1Client, file: string) {
  // TODO: Add permission check for current user?
  console.log(yellow(`Synchronizing Dispatchers from ${file}`));

  const localDispatchers = await extractDispatchersFromFile(file);
  const exhDispatchers = await dispatcherRepository.getByCliManagedTag(sdk);

  for (const localDispatcher of localDispatchers) {
    console.group(blue(`Dispatcher: ${localDispatcher.name}`));
    assertRequiredFields(localDispatcher);

    // TODO: This does not account for dispatchers that exist in Extra Horizon with an existing name, but not a EXH_CLI_MANAGED tag
    const exhDispatcher = exhDispatchers.find(({ name }) => name === localDispatcher.name);
    await synchronizeDispatcher(sdk, localDispatcher, exhDispatcher);
    console.groupEnd();
  }
}

async function synchronizeDispatcher(sdk: OAuth1Client, localDispatcher: DispatcherCreation, exhDispatcher: Dispatcher | undefined) {
  // Ensure all Dispatchers have the EXH_CLI_MANAGED tag
  const hasCliManagedTag = localDispatcher.tags.includes('EXH_CLI_MANAGED');
  if (!hasCliManagedTag) {
    localDispatcher.tags.push('EXH_CLI_MANAGED');
  }

  console.log(yellow('🔄  Synchronizing...'));
  if (!exhDispatcher) {
    await dispatcherRepository.create(sdk, localDispatcher);
  } else {
    await dispatcherRepository.update(sdk, exhDispatcher.id, localDispatcher);
    await synchronizeActions(sdk, localDispatcher, exhDispatcher);
  }
  console.log(green('✅  Synchronized'));
}

async function synchronizeActions(sdk: OAuth1Client, localDispatcher: DispatcherCreation, exhDispatcher: Dispatcher) {
  for (const localAction of localDispatcher.actions) {
    console.group(blue(`Action: ${localAction.name}`));
    const exhAction = exhDispatcher.actions.find(({ name }) => name === localAction.name);

    // Create or update Dispatcher actions that exist locally
    console.log(yellow('🔄  Synchronizing...'));
    if (!exhAction) {
      await dispatcherRepository.createAction(sdk, exhDispatcher.id, localAction);
    } else {
      await dispatcherRepository.updateAction(sdk, exhDispatcher.id, exhAction.id, localAction);
    }
    console.log(green('✅  Synchronized'));
    console.groupEnd();
  }

  // Find and delete Dispatcher actions that no longer exist locally
  for (const exhAction of exhDispatcher.actions) {
    const actionExistsLocally = localDispatcher.actions.some(({ name }) => name === exhAction.name);

    if (!actionExistsLocally) {
      console.group(blue(`Action: ${exhAction.name}`));
      console.log(yellow('🔄  Synchronizing...'));
      await dispatcherRepository.deleteAction(sdk, exhDispatcher.id, exhAction.id);
      console.log(green('✅  Synchronized'));
      console.groupEnd();
    }
  }
}

async function extractDispatchersFromFile(file: string) {
  const data = await readFile(file);
  const dispatchers: DispatcherCreation[] = JSON.parse(data.toString());

  return dispatchers;
}

function assertRequiredFields(dispatcher: DispatcherCreation) {
  console.log(yellow('🔄  Validating...'));

  // Ensure all dispatchers have names
  if (!dispatcher.name) {
    throw new Error('Dispatcher name is a required field');
  }

  // Ensure all actions have names
  const hasInvalidAction = dispatcher.actions.some(action => !action.name);
  if (hasInvalidAction) {
    throw new Error('Action name is a required field');
  }

  console.log(green('✅  Validated'));
}