import { ActionCreation, ActionUpdate, DispatcherCreation, DispatcherUpdate, OAuth1Client, ObjectId, RQLString } from '@extrahorizon/javascript-sdk';

export async function create(sdk: OAuth1Client, data: DispatcherCreation) {
  return await sdk.dispatchers.create(data);
}

export async function findAll(sdk: OAuth1Client, rql?: RQLString) {
  return await sdk.dispatchers.findAll({ rql });
}

export async function update(sdk: OAuth1Client, dispatcherId: ObjectId, data: DispatcherUpdate) {
  return await sdk.dispatchers.update(dispatcherId, data);
}

export async function remove(sdk: OAuth1Client, dispatcherId: ObjectId) {
  return await sdk.dispatchers.remove(dispatcherId);
}

export async function createAction(sdk: OAuth1Client, dispatcherId: ObjectId, data: ActionCreation) {
  return await sdk.dispatchers.actions.create(dispatcherId, data);
}

export async function updateAction(sdk: OAuth1Client, dispatcherId: ObjectId, actionId: ObjectId, data: ActionUpdate) {
  return await sdk.dispatchers.actions.update(dispatcherId, actionId, data);
}

export async function removeAction(sdk: OAuth1Client, dispatcherId: ObjectId, actionId: ObjectId) {
  return await sdk.dispatchers.actions.remove(dispatcherId, actionId);
}
