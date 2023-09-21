import { readFile } from 'fs/promises';
import { Dispatcher, DispatcherCreation, OAuth1Client, rqlBuilder } from '@extrahorizon/javascript-sdk';
import { blue, green, red, yellow } from 'chalk';
import * as dispatcherRepository from '../repositories/dispatchers';

export const cliManagedTag = 'EXH_CLI_MANAGED';

export async function sync(sdk: OAuth1Client, path: string) {
  console.log(yellow(`Synchronizing Dispatchers from ${path}`));

  const localDispatchers = await extractDispatchersFromFile(path);

  const rql = rqlBuilder().eq('tags', cliManagedTag).build();
  const exhDispatchers = await dispatcherRepository.findAll(sdk, rql);

  validateDispatchers(localDispatchers);

  console.group(blue('Synchronizing Dispatchers:'));
  for (const localDispatcher of localDispatchers) {
    // TODO: This does not account for dispatchers that exist in Extra Horizon with an existing name, but not a EXH_CLI_MANAGED tag
    const exhDispatcher = exhDispatchers.find(({ name }) => name === localDispatcher.name);
    await synchronizeDispatcher(sdk, localDispatcher, exhDispatcher);
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
    // Updating a Dispatcher will not update the actions, thus they must be synchronized separately
    console.group(blue(`Updating Dispatcher: ${localDispatcher.name}`));

    await dispatcherRepository.update(sdk, exhDispatcher.id, localDispatcher);
    await synchronizeActions(sdk, localDispatcher, exhDispatcher);

    console.groupEnd();
    console.log(green(`Updated Dispatcher: ${localDispatcher.name} ✓`));
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
      await dispatcherRepository.deleteAction(sdk, exhDispatcher.id, exhAction.id);
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

function validateDispatchers(dispatchers: DispatcherCreation[]) {
  let hasErrors = false;

  console.group(blue('Validating Dispatchers:'));
  dispatchers.forEach((dispatcher, index) => {
    const displayName = dispatcher?.name ? `[${index}]: ${dispatcher.name}` : `[${index}]: NO_NAME`;
    const errors = [];

    // Ensure all dispatchers have names
    if (!dispatcher.name) {
      errors.push('No name');
    }

    const hasActions = Array.isArray(dispatcher.actions) && dispatcher.actions.length > 0;
    if (!hasActions) {
      errors.push('Needs at least one action');
    } else {
      // Ensure all actions have names
      const hasValidActions = dispatcher.actions.every(action => action.name);
      if (!hasValidActions) {
        errors.push('Has actions without a name');
      }
    }

    if (errors.length === 0) {
      console.log(green(`✓ Valid Dispatcher: ${displayName}`));
    } else {
      hasErrors = true;
      console.group(red(`𝖷 Invalid Dispatcher: ${displayName}`));
      errors.forEach(error => console.log(red(`- ${error}`)));
      console.groupEnd();
    }
  });
  console.groupEnd();

  if (hasErrors) {
    throw new Error('\nThe dispatchers file is invalid');
  }
}
