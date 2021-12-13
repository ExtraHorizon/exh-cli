import ExH from '../../../exh';

/**
 * fetch a full schema from the service from a name
 * @param {string} name the name of a schema 
 */
export async function fetchSchemaByName(name) {
  const sdk = await ExH();
  return await sdk.data.schemas.findByName(name);
}

/**
 * create a schema using the data service
 * @param {string} name         name of the desired schema
 * @param {string} description  description of the schema
 */
export async function createSchema(name, description) {
  const sdk = await ExH();
  return await sdk.data.schemas.create({
    name,
    description
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
export async function updateSchema(id, data) {
  const sdk = await ExH();
  return await sdk.data.schemas.update(id,data);
}


/**
 * create a property
 * @param {string} id   the schema identifier
 * @param {object} data a property object
 * @param {string} data.name
 * @param {object} data.configuration
 * @param {string} data.configuration.type
 */
export async function createProperty(id, data) {
  const sdk = await ExH();
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
export async function updateProperty(id, path, data){
  const sdk = await ExH();
  return await sdk.raw.put(`/data/v1/${id}/properties/${path}`, data);
}

/**
 * delete a property
 * @param {string} id   the schema identifier
 * @param {string} path the property path
 */
export async function deleteProperty(id, path) {
  const sdk = await ExH();
  return await sdk.raw.delete(`/data/v1/${id}/properties/${path}`);
}


/**
 * create a status
 * @param {*} id    the schema identifier
 * @param {*} name  name of the new status
 * @param {*} data  a status object
 */
export async function createStatus(id, name, data) {
  const sdk = await ExH();
  return await sdk.raw.post(`/data/v1/${id}/statuses`, { name: name, data: data });
}

/**
 * update an existing status
 * @param {*} id    the schema identifier 
 * @param {*} name  the name of the status to update
 * @param {*} data  a status object
 */
export async function updateStatus(id, name, data) {
  const sdk = await ExH();
  return await sdk.raw.put(`/data/v1/${id}/statuses/${name}`, data);
}

/**
 * delete a status
 * @param {*} id    the schema identifier
 * @param {*} name  the name of the status to delete
 */
export async function deleteStatus(id, name) {
  const sdk = await ExH();
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
export async function updateCreationTransition(id, data) {
  const sdk = await ExH();
  return await sdk.raw.put(`/data/v1/${id}/creationTransition`, data);
}

/**
 * create a transition
 * @param {string} id       the schema identifier 
 * @param {transition} data a transition object
 */
export async function createTransition(id, data) {
  const sdk = await ExH();
  return await sdk.raw.post(`/data/v1/${id}/transitions`, data);
}

/**
 * update an exisiting transition 
 * @param {string} schemaId     the schema identifier
 * @param {string} transitionId the identifier of the transition to update
 * @param {transition} data     the new transition object data
 */
export async function updateTransition(schemaId, transitionId, data) {
  const sdk = await ExH();
  return await sdk.raw.put(`/data/v1/${schemaId}/transitions/${transitionId}`, data);
}

/**
 * delete an existing transition
 * @param {string} schemaId     the schema identifier
 * @param {string} transitionId  the identifier for the thransition to remove
 */
export async function deleteTransition(schemaId, transitionId) {
  const sdk = await ExH();
  return await sdk.raw.delete(`/data/v1/${schemaId}/transitions/${transitionId}`);
}
