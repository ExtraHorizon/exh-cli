import { ActionCreation, ActionUpdate, DispatcherCreation, DispatcherUpdate, ObjectId, RQLString } from '@extrahorizon/javascript-sdk';
import { getSdk } from '../exh';

export async function create(data: DispatcherCreation) {
  return await getSdk().dispatchers.create(data);
}

export async function findAll(rql?: RQLString) {
  return await getSdk().dispatchers.findAll({ rql });
}

export async function update(dispatcherId: ObjectId, data: DispatcherUpdate) {
  return await getSdk().dispatchers.update(dispatcherId, data);
}

export async function remove(dispatcherId: ObjectId) {
  return await getSdk().dispatchers.remove(dispatcherId);
}

export async function createAction(dispatcherId: ObjectId, data: ActionCreation) {
  return await getSdk().dispatchers.actions.create(dispatcherId, data);
}

export async function updateAction(dispatcherId: ObjectId, actionId: ObjectId, data: ActionUpdate) {
  return await getSdk().dispatchers.actions.update(dispatcherId, actionId, data);
}

export async function removeAction(dispatcherId: ObjectId, actionId: ObjectId) {
  return await getSdk().dispatchers.actions.remove(dispatcherId, actionId);
}
