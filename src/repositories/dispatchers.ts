import { ActionCreation, ActionUpdate, DispatcherCreation, DispatcherUpdate, OAuth1Client, ObjectId, rqlBuilder } from '@extrahorizon/javascript-sdk';

export async function create(sdk: OAuth1Client, data: DispatcherCreation) {
  return await sdk.dispatchers.create(data);
}

export async function getByCliManagedTag(sdk: OAuth1Client) {
  const rql = rqlBuilder()
    .eq('tags', 'EXH_CLI_MANAGED')
    .build();

  const { data } = await sdk.dispatchers.find({ rql });

  return data;
}

export async function update(sdk: OAuth1Client, id: string, data: DispatcherUpdate) {
  return await sdk.dispatchers.update(id, data);
}

export async function createAction(sdk: OAuth1Client, dispatcherId: ObjectId, data: ActionCreation) {
  return await sdk.dispatchers.actions.create(dispatcherId, data);
}

export async function updateAction(sdk: OAuth1Client, dispatcherId: ObjectId, actionId: ObjectId, data: ActionUpdate) {
  return await sdk.dispatchers.actions.update(dispatcherId, actionId, data);
}

export async function deleteAction(sdk: OAuth1Client, dispatcherId: ObjectId, actionId: ObjectId) {
  return await sdk.dispatchers.actions.remove(dispatcherId, actionId);
}
