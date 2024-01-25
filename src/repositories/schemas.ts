import { OAuth1Client, ObjectId } from '@extrahorizon/javascript-sdk';

interface Transition {
  name: string;
  type: string;
  fromStatuses: string[];
  toStatus: string;
  conditions: { type: string; };
  actions: { type: string; };
  afterActions: { type: string; };
}

export async function remove(sdk: OAuth1Client, schemaId: ObjectId) {
  return await sdk.data.schemas.remove(schemaId);
}

export async function disable(sdk: OAuth1Client, schemaId: ObjectId) {
  return await sdk.data.schemas.disable(schemaId);
}

/**
 * fetch a full schema from the service from a name
 * @param {string} name the name of a schema
 */
export async function fetchSchemaByName(sdk: OAuth1Client, name: string) {
  return await sdk.data.schemas.findByName(name);
}

/**
 * create a schema using the data service
 * @param {string} name         name of the desired schema
 * @param {string} description  description of the schema
 */
export async function createSchema(sdk: OAuth1Client, name: string, description: string) {
  return await sdk.data.schemas.create({
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
export async function updateSchema(sdk: OAuth1Client, id: string, data: any) {
  return await sdk.data.schemas.update(id, data);
}

/**
 * create a property
 * @param {string} id   the schema identifier
 * @param {object} data a property object
 * @param {string} data.name
 * @param {object} data.configuration
 * @param {string} data.configuration.type
 */
export async function createProperty(sdk: OAuth1Client, id: string, data: { name: string; configuration: { type: string; }; }) {
  return await sdk.raw.post(`/data/v1/${id}/properties`, data);
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
export async function updateProperty(sdk: OAuth1Client, id: string, path: string, data: { name: string; configuration: { type: string; }; }) {
  return await sdk.raw.put(`/data/v1/${id}/properties/${path}`, data);
}

/**
 * delete a property
 * @param {string} id   the schema identifier
 * @param {string} path the property path
 */
export async function deleteProperty(sdk: OAuth1Client, id: string, path: string) {
  return await sdk.raw.delete(`/data/v1/${id}/properties/${path}`);
}

/**
 * create a status
 * @param {*} id    the schema identifier
 * @param {*} name  name of the new status
 * @param {*} data  a status object
 */
export async function createStatus(sdk: OAuth1Client, id: string, name: string, data: object) {
  return await sdk.raw.post(`/data/v1/${id}/statuses`, { name, data });
}

/**
 * update an existing status
 * @param {*} id    the schema identifier
 * @param {*} name  the name of the status to update
 * @param {*} data  a status object
 */
export async function updateStatus(sdk: OAuth1Client, id: string, name: string, data: object) {
  return await sdk.raw.put(`/data/v1/${id}/statuses/${name}`, { data });
}

/**
 * delete a status
 * @param {*} id    the schema identifier
 * @param {*} name  the name of the status to delete
 */
export async function deleteStatus(sdk: OAuth1Client, id: string, name: string) {
  return await sdk.raw.delete(`/data/v1/${id}/statuses/${name}`);
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
export async function updateCreationTransition(sdk: OAuth1Client, id: string, data: Transition) {
  return await sdk.raw.put(`/data/v1/${id}/creationTransition`, data);
}

/**
 * create a transition
 * @param {string} id       the schema identifier
 * @param {transition} data a transition object
 */
export async function createTransition(sdk: OAuth1Client, id: string, data:Transition) {
  return await sdk.raw.post(`/data/v1/${id}/transitions`, data);
}

/**
 * update an exisiting transition
 * @param {string} schemaId     the schema identifier
 * @param {string} transitionId the identifier of the transition to update
 * @param {transition} data     the new transition object data
 */
export async function updateTransition(sdk: OAuth1Client, schemaId: string, transitionId:string, data:Transition) {
  return await sdk.raw.put(`/data/v1/${schemaId}/transitions/${transitionId}`, data);
}

/**
 * delete an existing transition
 * @param {string} schemaId     the schema identifier
 * @param {string} transitionId  the identifier for the thransition to remove
 */
export async function deleteTransition(sdk: OAuth1Client, schemaId:string, transitionId:string) {
  return await sdk.raw.delete(`/data/v1/${schemaId}/transitions/${transitionId}`);
}

/**
 * create an index
 * @param {string} schemaId     the schema identifier
 * @param {string} index      the identifier for the index to remove
 */
export async function createIndex(sdk: OAuth1Client, schemaId:string, index: any) {
  return await sdk.raw.post(`/data/v1/${schemaId}/indexes`, index);
}

/**
 * delete an existing index
 * @param {string} schemaId     the schema identifier
 * @param {string} indexId      the identifier for the index to remove
 */
export async function deleteIndex(sdk: OAuth1Client, schemaId:string, indexId:string) {
  return await sdk.raw.delete(`/data/v1/${schemaId}/indexes/${indexId}`);
}
