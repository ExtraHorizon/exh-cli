import { readFile } from 'fs/promises';
import { Dispatcher, DispatcherCreation, OAuth1Client, rqlBuilder } from '@extrahorizon/javascript-sdk';
import { blue, green, yellow } from 'chalk';
import * as dispatcherRepository from '../repositories/dispatchers';

export const cliManagedTag = 'EXH_CLI_MANAGED';

export async function sync(sdk: OAuth1Client, path: string) {
  console.log(yellow(`Synchronizing Dispatchers from ${path}`));

  const localDispatchers = await extractDispatchersFromFile(path);

  const rql = rqlBuilder().eq('tags', cliManagedTag).build();
  const exhDispatchers = await dispatcherRepository.findAll(sdk, rql);

  for (const localDispatcher of localDispatchers) {
    console.group(blue(`Synchronizing Dispatcher: ${localDispatcher.name}`));

    // Ensure all Dispatchers and actions have name fields
    assertRequiredFields(localDispatcher);

    // TODO: This does not account for dispatchers that exist in Extra Horizon with an existing name, but not a EXH_CLI_MANAGED tag
    const exhDispatcher = exhDispatchers.find(({ name }) => name === localDispatcher.name);
    await synchronizeDispatcher(sdk, localDispatcher, exhDispatcher);
    console.groupEnd();
  }
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
    // A create Dispatcher request will also create actions
    await dispatcherRepository.create(sdk, localDispatcher);
  } else {
    // Updating a Dispatcher will not update the actions, thus they must be synchronized separately
    await dispatcherRepository.update(sdk, exhDispatcher.id, localDispatcher);
    await synchronizeActions(sdk, localDispatcher, exhDispatcher);
  }

  console.log(green(`Synchronized Dispatcher: ${localDispatcher.name} ✓`));
}

async function synchronizeActions(sdk: OAuth1Client, localDispatcher: DispatcherCreation, exhDispatcher: Dispatcher) {
  for (const localAction of localDispatcher.actions) {
    console.group(blue(`Synchronizing Action: ${localAction.name}`));

    // Find the corresponding Dispatcher Action in Extra Horizon
    const exhAction = exhDispatcher.actions.find(({ name }) => name === localAction.name);

    // Create or update Dispatcher Actions that exist locally
    if (!exhAction) {
      await dispatcherRepository.createAction(sdk, exhDispatcher.id, localAction);
    } else {
      await dispatcherRepository.updateAction(sdk, exhDispatcher.id, exhAction.id, localAction);
    }

    console.log(green(`Synchronized Action: ${localAction.name} ✓`));
    console.groupEnd();
  }

  for (const exhAction of exhDispatcher.actions) {
    // Find the corresponding Dispatcher Action in the local file
    const actionExistsLocally = localDispatcher.actions.find(({ name }) => name === exhAction.name);

    // Delete Dispatcher Actions that do not exist locally, but exist in Extra Horizon
    if (!actionExistsLocally) {
      console.group(blue(`Deleting Action: ${exhAction.name}`));

      await dispatcherRepository.deleteAction(sdk, exhDispatcher.id, exhAction.id);

      console.log(green(`Synchronized Action: ${exhAction.name} ✓`));
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
    throw new Error('Dispatcher name is a required field');
  }

  const hasActions = Array.isArray(dispatcher.actions) && dispatcher.actions.length > 0;
  if (!hasActions) {
    throw new Error('A Dispatcher must have at least one action');
  }

  // Ensure all actions have names
  const hasValidActions = dispatcher.actions.every(action => action.name);
  if (!hasValidActions) {
    throw new Error('Action name is a required field');
  }

  console.log(green(`Validated Dispatcher: ${dispatcher.name} ✓`));
}
