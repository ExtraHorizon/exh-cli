import { ObjectId, rqlBuilder } from '@extrahorizon/javascript-sdk';
import { getSdk } from '../exh';

export interface Transition {
  name: string;
  type: string;
  fromStatuses: string[];
  toStatus: string;
  conditions: { type: string; };
  actions: { type: string; };
  afterActions: { type: string; };
}

export async function remove(schemaId: ObjectId) {
  return await getSdk().data.schemas.remove(schemaId);
}

export async function disable(schemaId: ObjectId) {
  return await getSdk().data.schemas.disable(schemaId);
}

/**
 * fetch a full schema from the service from a name
 * @param {string} name the name of a schema
 */
export async function fetchSchemaByName(name: string) {
  return await getSdk().data.schemas.findByName(name);
}

export async function fetchAll() {
  const rql = rqlBuilder().select(['id', 'name', 'description']).build();
  return await getSdk().data.schemas.findAll({ rql });
}

/**
 * create a schema using the data service
 * @param {string} name         name of the desired schema
 * @param {string} description  description of the schema
 */
export async function createSchema(name: string, description: string) {
  return await getSdk().data.schemas.create({
    name,
    description,
  });
}

/**
 * update root attributes of a schema
 * @param {string} id   the schema identifier
 * @param {object} data the target schema
 * @param {string} data.description
 * @param {number} data.defaultLimit
 * @param {number} data.maximumLimit
 */
export async function updateSchema(id: string, data: any) {
  return await getSdk().data.schemas.update(id, data);
}

/**
 * create a property
 * @param {string} id   the schema identifier
 * @param {object} data a property object
 * @param {string} data.name
 * @param {object} data.configuration
 * @param {string} data.configuration.type
 */
export async function createProperty(id: string, data: { name: string; configuration: { type: string; }; }) {
  const response = await getSdk().raw.post(`/data/v1/${id}/properties`, data);
  return response.data;
}

/**
 * update an existing property
 * @param {string} id   the schema identifier
 * @param {string} path the property path
 * @param {object} data a property object
 * @param {string} data.name
 * @param {object} data.configuration
 * @param {string} data.configuration.type
 */
export async function updateProperty(id: string, path: string, data: { name: string; configuration: { type: string; }; }) {
  const response = await getSdk().raw.put(`/data/v1/${id}/properties/${path}`, data);
  return response.data;
}

/**
 * delete a property
 * @param {string} id   the schema identifier
 * @param {string} path the property path
 */
export async function deleteProperty(id: string, path: string) {
  const response = await getSdk().raw.delete(`/data/v1/${id}/properties/${path}`);
  return response.data;
}

/**
 * create a status
 * @param {*} id    the schema identifier
 * @param {*} name  name of the new status
 * @param {*} data  a status object
 */
export async function createStatus(id: string, name: string, data: object) {
  const response = await getSdk().raw.post(`/data/v1/${id}/statuses`, { name, data });
  return response.data;
}

/**
 * update an existing status
 * @param {*} id    the schema identifier
 * @param {*} name  the name of the status to update
 * @param {*} data  a status object
 */
export async function updateStatus(id: string, name: string, data: object) {
  const response = await getSdk().raw.put(`/data/v1/${id}/statuses/${name}`, { data });
  return response.data;
}

/**
 * delete a status
 * @param {*} id    the schema identifier
 * @param {*} name  the name of the status to delete
 */
export async function deleteStatus(id: string, name: string) {
  const response = await getSdk().raw.delete(`/data/v1/${id}/statuses/${name}`);
  return response.data;
}

/**
 * transitions are complex objects
 * @typedef {object} transition
 * @property {string} name
 * @property {string} type
 * @property {string[]} fromStatuses list of names of the statuses from which this transition can occur
 * @property {string} toStatus       the target status for this transition
 * @property {{type: string}} conditions
 * @property {{type: string}} actions
 * @property {{type: string}} afterActions
 */

/**
 * update the creation transition
 * this property only gets an update operation, because it is automatically generated on
 * schema creation and should never be deleted.
 * @param {string} id       the schema identifier
 * @param {transition} data the new creationTransition data
 */
export async function updateCreationTransition(id: string, data: Transition) {
  const response = await getSdk().raw.put(`/data/v1/${id}/creationTransition`, data);
  return response.data;
}

/**
 * create a transition
 * @param {string} id       the schema identifier
 * @param {transition} data a transition object
 */
export async function createTransition(id: string, data:Transition) {
  const response = await getSdk().raw.post(`/data/v1/${id}/transitions`, data);
  return response.data;
}

/**
 * update an exisiting transition
 * @param {string} schemaId     the schema identifier
 * @param {string} transitionId the identifier of the transition to update
 * @param {transition} data     the new transition object data
 */
export async function updateTransition(schemaId: string, transitionId:string, data:Transition) {
  const response = await getSdk().raw.put(`/data/v1/${schemaId}/transitions/${transitionId}`, data);
  return response.data;
}

/**
 * delete an existing transition
 * @param {string} schemaId     the schema identifier
 * @param {string} transitionId  the identifier for the thransition to remove
 */
export async function deleteTransition(schemaId:string, transitionId:string) {
  const response = await getSdk().raw.delete(`/data/v1/${schemaId}/transitions/${transitionId}`);
  return response.data;
}

/**
 * create an index
 * @param {string} schemaId     the schema identifier
 * @param {string} index      the identifier for the index to remove
 */
export async function createIndex(schemaId:string, index: any) {
  const response = await getSdk().raw.post(`/data/v1/${schemaId}/indexes`, index);
  return response.data;
}

/**
 * delete an existing index
 * @param {string} schemaId     the schema identifier
 * @param {string} indexId      the identifier for the index to remove
 */
export async function deleteIndex(schemaId:string, indexId:string) {
  const response = await getSdk().raw.delete(`/data/v1/${schemaId}/indexes/${indexId}`);
  return response.data;
}
