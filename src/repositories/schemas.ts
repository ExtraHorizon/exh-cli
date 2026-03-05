import {
  ObjectId,
  rqlBuilder,
  StatusData,
  CreationTransition,
  IndexInput,
  TransitionInput,
  TypeConfiguration,
} from '@extrahorizon/javascript-sdk';
import { getSdk } from '../exh';

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
export async function createProperty(id: string, data: { name: string; configuration: TypeConfiguration; }) {
  return await getSdk().data.properties.create(id, data);
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
export async function updateProperty(id: string, path: string, data: TypeConfiguration) {
  return await getSdk().data.properties.update(id, path, data);
}

/**
 * delete a property
 * @param {string} id   the schema identifier
 * @param {string} path the property path
 */
export async function deleteProperty(id: string, path: string) {
  return await getSdk().data.properties.remove(id, path);
}

/**
 * create a status
 * @param {*} id    the schema identifier
 * @param {*} name  name of the new status
 * @param {*} data  a status object
 */
export async function createStatus(id: string, name: string, data: StatusData) {
  return getSdk().data.statuses.create(id, { name, data });
}

/**
 * update an existing status
 * @param {*} id    the schema identifier
 * @param {*} name  the name of the status to update
 * @param {*} data  a status object
 */
export async function updateStatus(id: string, name: string, data: StatusData) {
  return getSdk().data.statuses.update(id, name, data);
}

/**
 * delete a status
 * @param {*} id    the schema identifier
 * @param {*} name  the name of the status to delete
 */
export async function deleteStatus(id: string, name: string) {
  return getSdk().data.statuses.remove(id, name);
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
export async function updateCreationTransition(id: string, data: CreationTransition) {
  return getSdk().data.transitions.updateCreation(id, data);
}

/**
 * create a transition
 * @param {string} id       the schema identifier
 * @param {transition} data a transition object
 */
export async function createTransition(id: string, data:TransitionInput) {
  return getSdk().data.transitions.create(id, data);
}

/**
 * update an existing transition
 * @param {string} schemaId     the schema identifier
 * @param {string} transitionId the identifier of the transition to update
 * @param {transition} data     the new transition object data
 */
export async function updateTransition(schemaId: string, transitionId:string, data:TransitionInput) {
  return getSdk().data.transitions.update(schemaId, transitionId, data);
}

/**
 * delete an existing transition
 * @param {string} schemaId     the schema identifier
 * @param {string} transitionId  the identifier for the thransition to remove
 */
export async function deleteTransition(schemaId:string, transitionId:string) {
  return getSdk().data.transitions.remove(schemaId, transitionId);
}

/**
 * create an index
 * @param {string} schemaId     the schema identifier
 * @param {string} index      the identifier for the index to remove
 */
export async function createIndex(schemaId:string, index: IndexInput) {
  return getSdk().data.indexes.create(schemaId, index);
}

/**
 * delete an existing index
 * @param {string} schemaId     the schema identifier
 * @param {string} indexId      the identifier for the index to remove
 */
export async function deleteIndex(schemaId:string, indexId:string) {
  return getSdk().data.indexes.remove(indexId, schemaId);
}
