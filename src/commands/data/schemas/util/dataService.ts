interface Transition {
  name: string;
  type: string;
  fromStatuses: string[];
  toStatus: string;
  conditions: { type: string; };
  actions: { type: string; };
  afterActions: { type: string; };
}

export class DataService {
  private sdk: any;

  static createDataService(sdk: any): DataService {
    return new DataService(sdk);
  }

  constructor(sdk: any) {
    this.sdk = sdk;
  }

  /**
 * fetch a full schema from the service from a name
 * @param {string} name the name of a schema
 */
  async fetchSchemaByName(name: string) {
    return await this.sdk.data.schemas.findByName(name);
  }

  /**
 * create a schema using the data service
 * @param {string} name         name of the desired schema
 * @param {string} description  description of the schema
 */
  async createSchema(name: string, description: string) {
    return await this.sdk.data.schemas.create({
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
  async updateSchema(id: string, data: any) {
    return await this.sdk.data.schemas.update(id, data);
  }

  /**
 * create a property
 * @param {string} id   the schema identifier
 * @param {object} data a property object
 * @param {string} data.name
 * @param {object} data.configuration
 * @param {string} data.configuration.type
 */
  async createProperty(id: string, data: { name: string; configuration: { type: string; }; }) {
    return await this.sdk.raw.post(`/data/v1/${id}/properties`, data);
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
  async updateProperty(id: string, path: string, data: { name: string; configuration: { type: string; }; }) {
    return await this.sdk.raw.put(`/data/v1/${id}/properties/${path}`, data);
  }

  /**
 * delete a property
 * @param {string} id   the schema identifier
 * @param {string} path the property path
 */
  async deleteProperty(id: string, path: string) {
    return await this.sdk.raw.delete(`/data/v1/${id}/properties/${path}`);
  }

  /**
 * create a status
 * @param {*} id    the schema identifier
 * @param {*} name  name of the new status
 * @param {*} data  a status object
 */
  async createStatus(id: string, name: string, data: object) {
    return await this.sdk.raw.post(`/data/v1/${id}/statuses`, { name, data });
  }

  /**
 * update an existing status
 * @param {*} id    the schema identifier
 * @param {*} name  the name of the status to update
 * @param {*} data  a status object
 */
  async updateStatus(id: string, name: string, data: object) {
    return await this.sdk.raw.put(`/data/v1/${id}/statuses/${name}`, data);
  }

  /**
 * delete a status
 * @param {*} id    the schema identifier
 * @param {*} name  the name of the status to delete
 */
  async deleteStatus(id: string, name: string) {
    return await this.sdk.raw.delete(`/data/v1/${id}/statuses/${name}`);
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
  async updateCreationTransition(id: string, data: Transition) {
    return await this.sdk.raw.put(`/data/v1/${id}/creationTransition`, data);
  }

  /**
 * create a transition
 * @param {string} id       the schema identifier
 * @param {transition} data a transition object
 */
  async createTransition(id:string, data:Transition) {
    return await this.sdk.raw.post(`/data/v1/${id}/transitions`, data);
  }

  /**
 * update an exisiting transition
 * @param {string} schemaId     the schema identifier
 * @param {string} transitionId the identifier of the transition to update
 * @param {transition} data     the new transition object data
 */
  async updateTransition(schemaId: string, transitionId:string, data:Transition) {
    return await this.sdk.raw.put(`/data/v1/${schemaId}/transitions/${transitionId}`, data);
  }

  /**
 * delete an existing transition
 * @param {string} schemaId     the schema identifier
 * @param {string} transitionId  the identifier for the thransition to remove
 */
  async deleteTransition(schemaId:string, transitionId:string) {
    return await this.sdk.raw.delete(`/data/v1/${schemaId}/transitions/${transitionId}`);
  }

  /**
 * create an index
 * @param {string} schemaId     the schema identifier
 * @param {string} index      the identifier for the index to remove
 */
  async createIndex(schemaId:string, index: any) {
    return await this.sdk.raw.post(`/data/v1/${schemaId}/indexes`, index);
  }

  /**
 * delete an existing index
 * @param {string} schemaId     the schema identifier
 * @param {string} indexId      the identifier for the index to remove
 */
  async deleteIndex(schemaId:string, indexId:string) {
    return await this.sdk.raw.delete(`/data/v1/${schemaId}/indexes/${indexId}`);
  }
}
