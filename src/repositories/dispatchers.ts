import { DispatcherCreation, DispatcherUpdate, OAuth1Client, rqlBuilder } from '@extrahorizon/javascript-sdk';

export async function create(sdk: OAuth1Client, dispatcher: DispatcherCreation) {
  return await sdk.dispatchers.create(dispatcher);
}

export async function update(sdk: OAuth1Client, id: string, dispatcher: DispatcherUpdate) {
  return await sdk.dispatchers.update(id, dispatcher);
}

export async function getByCliManagedTag(sdk: OAuth1Client) {
  const rql = rqlBuilder()
    .eq('tags', 'EXH_CLI_MANAGED')
    .build();

  const { data } = await sdk.dispatchers.find({ rql });

  return data;
}
