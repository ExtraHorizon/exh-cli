import * as _ from 'lodash';
import {
  DataService,
} from './dataService';

export class SyncSchema {
  private ds: DataService;

  private current: any;

  private target: any;

  static createSchemaSync(sdk: any): SyncSchema {
    return new SyncSchema(sdk);
  }

  constructor(sdk: any) {
    this.ds = DataService.createDataService(sdk);
  }

  async sync(current: any, target: any) {
    this.current = current;
    this.target = target;

    if (!this.target.name) {
      console.log('No schema name defined, skipping this file');
      return;
    }
    console.log(`Syncing ${this.target.name}`);

    let currentSchema = await this.ds.fetchSchemaByName(this.target.name);

    if (!currentSchema) {
      currentSchema = await this.ds.createSchema(this.target.name, this.target.description);
    }

    //  root attributes: update
    await this.#syncRootAttributes();

    //  properties: add, update & remove
    await this.#syncProperties();

    //  statuses 1/2: add & update
    await this.#updateStatuses();

    //  creationTransition: update
    await this.#syncCreationTransition();

    // transtions: add, update & remove
    await this.#syncTransitions();

    //  statuses 2/2 remove
    await this.#pruneStatuses();
    // Indexes: identify by their fields and types
    //  add missing
    //  delete extra
  }

  /**
 * synchronize the root attributes of the current schema with those specified in the target schema
 * @param {object} currentSchema
 * @param {string} currentSchema.id
 * @param {string} currentSchema.description
 * @param {number} currentSchema.defaultLimit
 * @param {number} currentSchema.maximumLimit
 * @param {object} targetSchema
 * @param {string} targetSchema.description
 * @param {number} targetSchema.defaultLimit
 * @param {number} targetSchema.maximumLimit
 */
  async #syncRootAttributes() {
    const diff = deepDiff(
      _.pick(this.target, 'description', 'defaultLimit', 'maximumLimit', 'createMode', 'readMode', 'updateMode', 'groupSyncMode'),
      _.pick(this.current, 'description', 'defaultLimit', 'maximumLimit', 'createMode', 'readMode', 'updateMode', 'groupSyncMode')
    );

    if (Object.keys(diff).length > 0) {
      await this.ds.updateSchema(this.current.id, diff);
    }
  }

  /**
 * synchronize the properties of the current schema with those specified in the target schema
 * @param {object} currentSchema
 * @param {string} currentSchema.id
 * @param {object} currentSchema.properties
 * @param {object} targetSchema
 * @param {object} targetSchema.properties
 */
  async #syncProperties() {
    if (!this.target.properties) {
      console.log(`Skipping properties: No properties defined in local ${this.target.name} schema`);
      return;
    }

    // calculate missing properties
    const missingProperties = _.difference(
      Object.keys(this.target.properties),
      Object.keys(this.current.properties)
    );

    // calculate excess properties
    const excessProperties = _.difference(
      Object.keys(this.current.properties),
      Object.keys(this.target.properties)
    );

    // calculate properties which have changed
    const incorrectProperties:any = deepDiff(
      _(this.target.properties).omit(missingProperties).value(),
      _(this.current.properties).omit(excessProperties).value()
    );

    //  add missing
    for (const key of missingProperties) {
      console.log(`properties: adding ${key}`);
      await this.ds.createProperty(this.current.id, {
        name: key,
        configuration: this.target.properties[key],
      });
    }

    //  update existing where needed
    for (const key of Object.keys(incorrectProperties)) {
      console.log(`properties: updating ${key}`);
      await this.ds.updateProperty(this.current.id, key, this.target.properties[key]);
    }

    //  delete excess
    for (const key of excessProperties) {
      console.log(`properties: removing ${key}`);
      await this.ds.deleteProperty(this.current.id, key);
    }
  }

  /**
 * update the statuses of the current schema with those specified of the target schema.
 * This is operation 1 of 2 in synchronizing the statuses, as deleting statuses too early will result in broken
 * transitions, but adjusting the transtitions with new statuses requires these to be (re-)defined first.
 * @param {object} currentSchema
 * @param {string} currentSchema.id
 * @param {object} currentSchema.statuses
 * @param {object} targetSchema
 * @param {object} targetSchema.statuses
 */
  async #updateStatuses() {
    if (!this.target.statuses) {
      console.log(`Skipping statuses: No statuses defined in local ${this.target.name} schema`);
      return;
    }

    // add missing
    const missingStatuses = _.difference(
      Object.keys(this.target.statuses),
      Object.keys(this.current.statuses)
    );

    for (const key of missingStatuses) {
      console.log(`statuses: adding ${key}`);
      await this.ds.createStatus(this.current.id, key, this.target.statuses[key]);
    }

    // update existing statuses where needed
    const incorrectStatuses:any = deepDiff(
      _.omit(this.target.statuses, missingStatuses),
      this.current.statuses
    );

    for (const key of Object.keys(incorrectStatuses)) {
      console.log(`statuses: updating ${key}`);
      await this.ds.updateStatus(this.current.id, key, this.target.statuses[key]);
    }
    // don't delete yet, first some other data needs to be adjusted
  }

  /**
 * transitions are complex objects
 * @typedef {object} transition
 * @property {string} name
 * @property {string} type
 * @property {string[]} fromStatuses
 * @property {string} toStatus
 * @property {{type: string}} conditions
 * @property {{type: string}} actions
 * @property {{type: string}} afterActions
 */

  /**
 * synchronize the creation transition of the current schema with those specified in the target schema
 * @param {object} currentSchema
 * @param {string} currentSchema.id
 * @param {transition} currentSchema.creationTransition
 * @param {object} targetSchema
 * @param {transition} targetSchema.creationTransition
 */
  async #syncCreationTransition() {
    if (!this.target.creationTransition) {
      console.log(`Skipping creationTransition: No creationTransition defined in local ${this.target.name} schema`);
      return;
    }

    if (!_.isEqual(this.current.creationTransition, this.target.creationTransition)) {
      console.log('creation transition: updating');
      await this.ds.updateCreationTransition(this.current.id, this.target.creationTransition);
    }
  }

  /**
 * Synchronizes the transitions of the current schema with those specified in the target schema
 * @param {object} currentSchema
 * @param {string} currentSchema.id
 * @param {transition[]} currentSchema.transitions
 * @param {object} targetSchema
 * @param {transition[]} targetSchema.transitions
 */
  async #syncTransitions() {
    if (!this.target.transitions) {
      console.log(`Skipping transitions: No transitions defined in local ${this.target.name} schema`);
      return;
    }

    // evaluate missing
    const missingTransitions:any = _.differenceBy(
      this.target.transitions,
      this.target.transitions,
      'name'
    );

    // evaluate excess
    const excessTransitions:any = _.differenceBy(
      this.current.transitions,
      this.target.transitions,
      'name'
    );

    // evaluate incorrect - helper comparison
    const compareTransitions = (targetTransition: any, currentTransition: any) => _.isEqual(
      targetTransition,
      _.omit(currentTransition, ['id'])
    ); // (ignore auto-generated id in comparison)

    // evaluate incorrect
    const incorrectTransitions:any = _.differenceWith(
    // targets, omit missing
      _.differenceBy(this.target.transitions, missingTransitions, 'name'),
      // current, omit excess
      _.differenceBy(this.current.transitions, excessTransitions, 'name'),
      // compare via helper function
      compareTransitions
    );

    //  add missing
    for (const targetTransition of missingTransitions) {
      console.log(`transitions: adding ${targetTransition.name}`);
      await this.ds.createTransition(this.current.id, targetTransition);
    }

    // update - helper function
    const findTransitionByName = (name: string) => _.find(
      this.current.transitions,
      transition => transition.name === name
    );

    //  update existing where necessary
    for (const targetTransition of incorrectTransitions) {
      console.log(`transitions: updating ${targetTransition.name}`);
      const currentTransition = findTransitionByName(targetTransition.name);
      await this.ds.updateTransition(this.current.id, currentTransition.id, targetTransition);
    }

    //  delete excess
    for (const currentTransition of excessTransitions) {
      console.log(`transitions: removing ${currentTransition.name}`);
      await this.ds.deleteTransition(this.current.id, currentTransition.id);
    }
  }

  /**
 * prunes the excess statuses from the current schema
 * @param {object} currentSchema
 * @param {string} currentSchema.id
 * @param {object} currentSchema.statuses
 * @param {object} targetSchema
 * @param {object} targetSchema.statuses
 */
  async #pruneStatuses() {
    if (!this.target.statuses) {
      console.log(`Skipping statuses: No statuses defined in local ${this.target.name} schema`);
      return;
    }
    // calculate excess statuses
    const excessStatuses = _.difference(
      Object.keys(this.current.statuses),
      Object.keys(this.target.statuses)
    );
    //  delete excess statuses
    for (const key of excessStatuses) {
      console.log(`statuses: removing ${key}`);
      await this.ds.deleteStatus(this.current.id, key);
    }
  }
}

/**
 * Deep difference between two objects
 * @todo include a step that goes into arrays?
 * @param  {object} object object compared
 * @param  {object} other  object whose matching values are excluded
 * @return {object}        Returns a new object representing the difference
 */
function deepDiff(object: any, other: any) {
  // transform iterates over object
  return _.transform(object, (result, value, key) => {
    // compare to value in other object at same key
    if (!_.isEqual(value, other[key])) {
      // check if recursion is neccessary
      /* eslint-disable-next-line no-param-reassign */
      result[key] = _.isObject(value) && _.isObject(other[key]) ? deepDiff(value, other[key]) : value;
    }
  });
}

