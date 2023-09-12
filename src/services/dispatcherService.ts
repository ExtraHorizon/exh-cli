import { readFile } from 'fs/promises';
import { FieldFormatError, OAuth1Client, OAuth2Client } from '@extrahorizon/javascript-sdk';
import { Dispatcher } from '../models/dispatcher';

export async function sync(_sdk: OAuth1Client | OAuth2Client, file: any) {
  // TODO: Add permission check for current user?
  console.log(`Synchronizing Dispatchers from ${file}`);
  const dispatchers = await extractDispatchersFromFile(file);

  for (const dispatcher of dispatchers) {
    console.log(`Validating Dispatcher: ${dispatcher.name}`);
    assertRequiredFields(dispatcher);

    console.log(`Synchronizing Dispatcher: ${dispatcher.name}`);
    // TODO: Synchronize dispatcher
  }
}

async function extractDispatchersFromFile(file: string) {
  const data = await readFile(file);
  const dispatchers: Dispatcher[] = JSON.parse(data.toString());

  return dispatchers;
}

function assertRequiredFields(dispatcher: Dispatcher) {
  // Ensure all dispatchers have names
  if (!dispatcher.name) {
    throw new FieldFormatError('Dispatcher name is a required field');
  }

  // Ensure all actions have names
  for (const action of dispatcher.actions) {
    if (!action.name) {
      throw new FieldFormatError('Action name is a required field');
    }
  }
}
