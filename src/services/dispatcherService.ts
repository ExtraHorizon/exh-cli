import { readFile } from 'fs/promises';
import { Dispatcher, DispatcherCreation, OAuth1Client } from '@extrahorizon/javascript-sdk';
import { green, yellow, blue } from 'chalk';
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
  }
}

async function synchronizeDispatcher(sdk: OAuth1Client, localDispatcher: DispatcherCreation, exhDispatcher: Dispatcher | undefined) {
  // Ensure all Dispatchers have the EXH_CLI_MANAGED tag
  const hasCliManagedTag = localDispatcher.tags.includes('EXH_CLI_MANAGED');
  if (!hasCliManagedTag) {
    localDispatcher.tags.push('EXH_CLI_MANAGED');
  }

  if (!exhDispatcher) {
    // Create a new Dispatcher
    console.log(yellow('🔄  Creating...'));
    await dispatcherRepository.create(sdk, localDispatcher);
    console.log(green('✅  Created'));
  } else {
    // Update an existing Dispatcher
    console.log(yellow('🔄  Updating...'));
    await dispatcherRepository.update(sdk, exhDispatcher.id, localDispatcher);
    console.log(green('✅  Updated'));
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
  for (const action of dispatcher.actions) {
    if (!action.name) {
      throw new Error('Action name is a required field');
    }
  }

  console.log(green('✅  Validated'));
}
