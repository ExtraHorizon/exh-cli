import { Dispatcher, DispatcherCreation, MailActionCreation, rqlBuilder } from '@extrahorizon/javascript-sdk';
import { blue, green, yellow } from 'chalk';
import * as dispatcherRepository from '../../repositories/dispatchers';
import * as templateRepository from '../../repositories/templatesV2';
import { readAndValidateDispatcherConfig } from './util/readDispatcherFile';

export const cliManagedTag = 'EXH_CLI_MANAGED';

export async function sync(path: string, clean = false) {
  console.log(yellow(`Synchronizing Dispatchers from ${path}`));

  const localDispatchers = await readAndValidateDispatcherConfig(path);

  const rql = rqlBuilder().eq('tags', cliManagedTag).build();
  const exhDispatchers = await dispatcherRepository.findAll(rql);

  console.group(blue('Synchronizing Dispatchers:'));
  for (const localDispatcher of localDispatchers) {
    // TODO: This does not account for dispatchers that exist in Extra Horizon with an existing name, but not a EXH_CLI_MANAGED tag
    const exhDispatcher = exhDispatchers.find(({ name }) => name === localDispatcher.name);
    await synchronizeDispatcher(localDispatcher, exhDispatcher);
  }

  // Remove Dispatchers that exist on Extra Horizon with the EXH_CLI_MANAGED tag, but do not exist locally
  if (clean) {
    await removeDispatchers(localDispatchers, exhDispatchers);
  }
  console.groupEnd();
}

async function synchronizeDispatcher(localDispatcher: DispatcherCreation, exhDispatcher?: Dispatcher) {
  const dispatcherWithTag = ensureCliManagedTag(localDispatcher);
  const dispatcherWithResolvedTemplateIds = await resolveTemplateIds(dispatcherWithTag);

  if (!exhDispatcher) {
    await createDispatcher(dispatcherWithResolvedTemplateIds);
  } else {
    await updateDispatcher(dispatcherWithResolvedTemplateIds, exhDispatcher);
  }
}

function ensureCliManagedTag(dispatcher: DispatcherCreation): DispatcherCreation {
  const tags = dispatcher.tags ?? [];
  if (tags.includes(cliManagedTag)) {
    return dispatcher;
  }

  return { ...dispatcher, tags: [...tags, cliManagedTag] };
}

async function resolveTemplateIds(dispatcher: DispatcherCreation): Promise<DispatcherCreation> {
  const resolvedActions: DispatcherCreation['actions'] = [];

  for (const action of dispatcher.actions) {
    if (action.type !== 'mail') {
      resolvedActions.push(action);
      continue;
    }

    const mailAction = action as MailActionCreation & { templateName?: string; };
    if (!mailAction.templateName) {
      resolvedActions.push(action);
      continue;
    }

    const template = await templateRepository.findByName(mailAction.templateName);
    if (!template) {
      throw new Error(`Template "${mailAction.templateName}" not found for Action "${action.name}"`);
    }

    resolvedActions.push({ ...action, templateId: template.id });
  }

  return { ...dispatcher, actions: resolvedActions };
}

async function createDispatcher(dispatcher: DispatcherCreation) {
  // A create Dispatcher request will also create actions
  console.group(blue(`Creating Dispatcher: ${dispatcher.name}`));
  await dispatcherRepository.create(dispatcher);

  // Aligns the logs for creating a new Dispatcher with Updating a Dispatcher
  for (const action of dispatcher.actions) {
    console.log(green(`✓ Action: ${action.name}`));
  }

  console.groupEnd();
  console.log(green(`✓ Created Dispatcher: ${dispatcher.name}`));
}

async function updateDispatcher(localDispatcher: DispatcherCreation, exhDispatcher: Dispatcher) {
  console.group(blue(`Updating Dispatcher: ${localDispatcher.name}`));
  await dispatcherRepository.update(exhDispatcher.id, localDispatcher);

  // Updating a Dispatcher will not update the actions, thus they must be synchronized separately
  await synchronizeActions(localDispatcher, exhDispatcher);

  console.groupEnd();
  console.log(green(`✓ Updated Dispatcher: ${localDispatcher.name}`));
}

async function removeDispatchers(localDispatchers: DispatcherCreation[], exhDispatchers: Dispatcher[]) {
  for (const exhDispatcher of exhDispatchers) {
    // Find the corresponding Dispatcher in the local file
    const localDispatcher = localDispatchers.find(({ name }) => name === exhDispatcher.name);

    // Delete Dispatchers that do not exist locally, but exist in Extra Horizon
    if (!localDispatcher) {
      console.log(blue(`Deleting Dispatcher: ${exhDispatcher.name}`));
      await dispatcherRepository.remove(exhDispatcher.id);
      console.log(green(`✓ Deleted Dispatcher: ${exhDispatcher.name}`));
    }
  }
}

async function synchronizeActions(localDispatcher: DispatcherCreation, exhDispatcher: Dispatcher) {
  for (const localAction of localDispatcher.actions) {
    // Find the corresponding Dispatcher Action in Extra Horizon
    const exhAction = exhDispatcher.actions.find(({ name }) => name === localAction.name);

    // Create or update Dispatcher Actions that exist locally
    if (!exhAction) {
      console.log(yellow(`Creating Action: ${localAction.name}`));
      await dispatcherRepository.createAction(exhDispatcher.id, localAction);
      console.log(green(`✓ Created Action: ${localAction.name}`));
    } else {
      console.log(yellow(`Updating Action: ${localAction.name}`));
      await dispatcherRepository.updateAction(exhDispatcher.id, exhAction.id, localAction);
      console.log(green(`✓ Updated Action: ${localAction.name}`));
    }
  }

  for (const exhAction of exhDispatcher.actions) {
    // Find the corresponding Dispatcher Action in the local file
    const actionExistsLocally = localDispatcher.actions.find(({ name }) => name === exhAction.name);

    // Delete Dispatcher Actions that do not exist locally, but exist in Extra Horizon
    if (!actionExistsLocally) {
      console.group(blue(`Deleting Action: ${exhAction.name}`));
      await dispatcherRepository.removeAction(exhDispatcher.id, exhAction.id);
      console.log(green(`✓ Deleted Action: ${exhAction.name}`));
      console.groupEnd();
    }
  }
}
