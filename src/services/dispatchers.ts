import { readFile } from 'fs/promises';
import { Dispatcher, DispatcherCreation, OAuth1Client, rqlBuilder } from '@extrahorizon/javascript-sdk';
import { blue, green, yellow } from 'chalk';
import * as dispatcherRepository from '../repositories/dispatchers';

export const cliManagedTag = 'EXH_CLI_MANAGED';

export async function sync(sdk: OAuth1Client, path: string, clean = false) {
  console.log(yellow(`Synchronizing Dispatchers from ${path}`));

  const localDispatchers = await extractDispatchersFromFile(path);

  const rql = rqlBuilder().eq('tags', cliManagedTag).build();
  const exhDispatchers = await dispatcherRepository.findAll(sdk, rql);

  // Ensure all Dispatchers and actions have name fields
  console.group(blue('Validating Dispatchers:'));
  for (const localDispatcher of localDispatchers) {
    assertRequiredFields(localDispatcher);
  }
  console.groupEnd();

  console.group(blue('Synchronizing Dispatchers:'));
  for (const localDispatcher of localDispatchers) {
    // TODO: This does not account for dispatchers that exist in Extra Horizon with an existing name, but not a EXH_CLI_MANAGED tag
    const exhDispatcher = exhDispatchers.find(({ name }) => name === localDispatcher.name);
    await synchronizeDispatcher(sdk, localDispatcher, exhDispatcher);
  }

  // Remove Dispatchers that exist on Extra Horizon with the EXH_CLI_MANAGED tag, but do not exist locally
  if (clean) {
    await removeDispatchers(sdk, localDispatchers, exhDispatchers);
  }
  console.groupEnd();
}

async function synchronizeDispatcher(sdk: OAuth1Client, localDispatcher: DispatcherCreation, exhDispatcher?: Dispatcher) {
  // Ensure all Dispatchers have the EXH_CLI_MANAGED tag
  // eslint-disable-next-line no-param-reassign
  localDispatcher.tags = localDispatcher.tags || [];
  const hasCliManagedTag = localDispatcher.tags.includes(cliManagedTag);

  if (!hasCliManagedTag) {
    localDispatcher.tags.push(cliManagedTag);
  }

  if (!exhDispatcher) {
    await createDispatcher(sdk, localDispatcher);
  } else {
    await updateDispatcher(sdk, localDispatcher, exhDispatcher);
  }
}

async function createDispatcher(sdk: OAuth1Client, dispatcher: DispatcherCreation) {
  // A create Dispatcher request will also create actions
  console.group(blue(`Creating Dispatcher: ${dispatcher.name}`));
  await dispatcherRepository.create(sdk, dispatcher);

  // Aligns the logs for creating a new Dispatcher with Updating a Dispatcher
  for (const action of dispatcher.actions) {
    console.log(green(`Action: ${action.name} ✓`));
  }

  console.groupEnd();
  console.log(green(`Created Dispatcher: ${dispatcher.name} ✓`));
}

async function updateDispatcher(sdk: OAuth1Client, localDispatcher: DispatcherCreation, exhDispatcher: Dispatcher) {
  console.group(blue(`Updating Dispatcher: ${localDispatcher.name}`));
  await dispatcherRepository.update(sdk, exhDispatcher.id, localDispatcher);

  // Updating a Dispatcher will not update the actions, thus they must be synchronized separately
  await synchronizeActions(sdk, localDispatcher, exhDispatcher);

  console.groupEnd();
  console.log(green(`Updated Dispatcher: ${localDispatcher.name} ✓`));
}

async function removeDispatchers(sdk: OAuth1Client, localDispatchers: DispatcherCreation[], exhDispatchers: Dispatcher[]) {
  for (const exhDispatcher of exhDispatchers) {
    // Find the corresponding Dispatcher in the local file
    const localDispatcher = localDispatchers.find(({ name }) => name === exhDispatcher.name);

    // Delete Dispatchers that do not exist locally, but exist in Extra Horizon
    if (!localDispatcher) {
      console.log(blue(`Deleting Dispatcher: ${exhDispatcher.name}`));
      await dispatcherRepository.remove(sdk, exhDispatcher.id);
      console.log(green(`Deleted Dispatcher: ${exhDispatcher.name} ✓`));
    }
  }
}

async function synchronizeActions(sdk: OAuth1Client, localDispatcher: DispatcherCreation, exhDispatcher: Dispatcher) {
  for (const localAction of localDispatcher.actions) {
    // Find the corresponding Dispatcher Action in Extra Horizon
    const exhAction = exhDispatcher.actions.find(({ name }) => name === localAction.name);

    // Create or update Dispatcher Actions that exist locally
    if (!exhAction) {
      console.log(yellow(`Creating Action: ${localAction.name}`));
      await dispatcherRepository.createAction(sdk, exhDispatcher.id, localAction);
      console.log(green(`Created Action: ${localAction.name} ✓`));
    } else {
      console.log(yellow(`Updating Action: ${localAction.name}`));
      await dispatcherRepository.updateAction(sdk, exhDispatcher.id, exhAction.id, localAction);
      console.log(green(`Updated Action: ${localAction.name} ✓`));
    }
  }

  for (const exhAction of exhDispatcher.actions) {
    // Find the corresponding Dispatcher Action in the local file
    const actionExistsLocally = localDispatcher.actions.find(({ name }) => name === exhAction.name);

    // Delete Dispatcher Actions that do not exist locally, but exist in Extra Horizon
    if (!actionExistsLocally) {
      console.group(blue(`Deleting Action: ${exhAction.name}`));
      await dispatcherRepository.removeAction(sdk, exhDispatcher.id, exhAction.id);
      console.log(green(`Deleted Action: ${exhAction.name} ✓`));
      console.groupEnd();
    }
  }
}

async function extractDispatchersFromFile(path: string): Promise<DispatcherCreation[]> {
  try {
    const data = await readFile(path);
    return JSON.parse(data.toString());
  } catch (error) {
    throw new Error(`Failed to read Dispatchers from ${path}: ${error.message}`);
  }
}

function assertRequiredFields(dispatcher: DispatcherCreation) {
  // Ensure all dispatchers have names
  if (!dispatcher.name) {
    throw new Error('Invalid Dispatcher: Dispatcher without a name 𝖷');
  }

  const hasActions = Array.isArray(dispatcher.actions) && dispatcher.actions.length > 0;
  if (!hasActions) {
    throw new Error(`Invalid Dispatcher: ${dispatcher.name} needs at least one action 𝖷`);
  }

  // Ensure all actions have names
  const hasValidActions = dispatcher.actions.every(action => action.name);
  if (!hasValidActions) {
    throw new Error(`Invalid Dispatcher: ${dispatcher.name} has actions without a name 𝖷`);
  }

  console.log(green(`Validated Dispatcher: ${dispatcher.name} ✓`));
}
