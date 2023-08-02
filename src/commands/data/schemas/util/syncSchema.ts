/* eslint-disable lines-between-class-members */
import * as _ from 'lodash';
import {
  DataService,
} from './dataService';

export class SyncSchema {
  private ds: DataService;
  private cloudSchema: any = null;
  private localSchema: any = null;

  static createSchemaSync(sdk: any): SyncSchema {
    return new SyncSchema(sdk);
  }

  constructor(sdk: any) {
    this.ds = DataService.createDataService(sdk);
  }

  async sync(target: any) {
    this.localSchema = target;

    if (!this.localSchema.name) {
      console.log('No schema name defined, skipping this file');
      return;
    }
    console.log(`Syncing ${this.localSchema.name}`);

    this.cloudSchema = await this.ds.fetchSchemaByName(this.localSchema.name);

    if (!this.cloudSchema) {
      this.cloudSchema = await this.ds.createSchema(this.localSchema.name, this.localSchema.description);
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

    // Indexes: add, update & remove
    await this.#syncIndexes();
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
    const diff = diffRootAttributes(this.localSchema, this.cloudSchema);

    if (Object.keys(diff).length > 0) {
      await this.ds.updateSchema(this.cloudSchema.id, diff);
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
    if (!this.localSchema.properties) {
      console.log(`Skipping properties: No properties defined in local ${this.localSchema.name} schema`);
      return;
    }

    const { toAdd, toRemove, toUpdate } = compareSchemaKey(this.localSchema, this.cloudSchema, 'properties');

    //  add missing
    for (const key of toAdd) {
      console.log(`properties: adding ${key}`);
      await this.ds.createProperty(this.cloudSchema.id, {
        name: key,
        configuration: this.localSchema.properties[key],
      });
    }

    //  update existing where needed
    for (const key of toUpdate) {
      console.log(`properties: updating ${key}`);
      await this.ds.updateProperty(
        this.cloudSchema.id,
        key,
        this.localSchema.properties[key]
      );
    }

    //  delete excess
    for (const key of toRemove) {
      console.log(`properties: removing ${key}`);
      await this.ds.deleteProperty(this.cloudSchema.id, key);
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
    if (!this.localSchema.statuses) {
      console.log(`Skipping statuses: No statuses defined in local ${this.localSchema.name} schema`);
      return;
    }

    const { toAdd, toUpdate } = compareSchemaKey(this.localSchema, this.cloudSchema, 'statuses');

    for (const key of toAdd) {
      console.log(`statuses: adding ${key}`);
      await this.ds.createStatus(this.cloudSchema.id, key, this.localSchema.statuses[key]);
    }

    for (const key of toUpdate) {
      console.log(`statuses: updating ${key}`);
      await this.ds.updateStatus(this.cloudSchema.id, key, this.localSchema.statuses[key]);
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
    if (!this.localSchema.creationTransition) {
      console.log(`Skipping creationTransition: No creationTransition defined in local ${this.localSchema.name} schema`);
      return;
    }

    if (!_.isEqual(this.cloudSchema.creationTransition, this.localSchema.creationTransition)) {
      console.log('creation transition: updating');
      await this.ds.updateCreationTransition(this.cloudSchema.id, this.localSchema.creationTransition);
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
    if (!this.localSchema.transitions) {
      console.log(`Skipping transitions: No transitions defined in local ${this.localSchema.name} schema`);
      return;
    }

    const { toAdd, toRemove, toUpdate } = compareSchemaKey(this.localSchema, this.cloudSchema, 'transitions');

    for (const transition of toAdd) {
      console.log(`transitions: adding ${transition.name}`);
      await this.ds.createTransition(this.cloudSchema.id, transition);
    }

    for (const transition of toUpdate) {
      console.log(`transitions: updating ${transition.name}`);
      const currentTransition = findTransitionByName(transition.name, this.cloudSchema.transitions);
      await this.ds.updateTransition(this.cloudSchema.id, currentTransition.id, transition);
    }

    for (const transition of toRemove) {
      console.log(`transitions: removing ${transition.name}`);
      await this.ds.deleteTransition(this.cloudSchema.id, transition.id);
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
    if (!this.localSchema.statuses) {
      console.log(`Skipping statuses: No statuses defined in local ${this.localSchema.name} schema`);
      return;
    }
    // calculate excess statuses
    const excessStatuses = _.difference(
      Object.keys(this.cloudSchema.statuses),
      Object.keys(this.localSchema.statuses)
    );
    //  delete excess statuses
    for (const key of excessStatuses) {
      console.log(`statuses: removing ${key}`);
      await this.ds.deleteStatus(this.cloudSchema.id, key);
    }
  }

  async #syncIndexes() {
    if (!this.localSchema.indexes) {
      console.log(`Skipping indexes: No indexes defined in local ${this.localSchema.name} schema`);
      return;
    }

    const { newIndexes, removedIndexes } = compareIndexes(this.localSchema, this.cloudSchema);

    /*  Delete indexes to be deleted */
    for (const idx of removedIndexes) {
      console.log(`Indexes: remove index ${idx.id}`);
      await this.ds.deleteIndex(this.cloudSchema.id, idx.id);
    }

    /* Create new indexes */
    for (const idx of newIndexes) {
      console.log('\t-> Creating new index');
      await this.ds.createIndex(this.cloudSchema.id, idx);
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

function diffRootAttributes(localSchema: any, cloudSchema: any) {
  return deepDiff(
    _.pick(localSchema, 'description', 'defaultLimit', 'maximumLimit', 'createMode', 'readMode', 'updateMode', 'deleteMode', 'groupSyncMode'),
    _.pick(cloudSchema, 'description', 'defaultLimit', 'maximumLimit', 'createMode', 'readMode', 'updateMode', 'deleteMode', 'groupSyncMode')
  );
}

export function compareSchemaKey(localSchema: any, cloudSchema: any, key: string) {
  if (!localSchema[key] && !cloudSchema[key]) {
    return {
      toAdd: [],
      toRemove: [],
      toUpdate: [],
    };
  }

  if (
    Array.isArray(localSchema[key]) ||
    (!localSchema[key] && Array.isArray(cloudSchema[key]))
  ) {
    return compareArraysByName(
      localSchema[key],
      cloudSchema[key]
    );
  }
  return compareSchemas(
    localSchema[key],
    cloudSchema[key]
  );
}

function compareSchemas(localSchema: any, cloudSchema: any) {
  const toAdd = _.difference(
    Object.keys(localSchema),
    Object.keys(cloudSchema)
  );

  // calculate excess properties
  const toRemove = _.difference(
    Object.keys(cloudSchema),
    Object.keys(localSchema)
  );

  // calculate properties which have changed
  const toUpdate: any = Object.keys(deepDiff(
    _(localSchema).omit(toAdd).value(),
    _(cloudSchema).omit(toRemove).value()
  ));

  return {
    toAdd,
    toRemove,
    toUpdate,
  };
}

function compareArraysByName(localSchema: any[], cloudSchema: any[]) {
  const toAdd: any[] = _.differenceBy(
    localSchema,
    cloudSchema,
    'name'
  );

  // evaluate excess
  const toRemove: any[] = _.differenceBy(
    cloudSchema,
    localSchema,
    'name'
  );

  // evaluate incorrect
  const toUpdate: any = _.differenceWith(
    // local schema, omit missing
    _.differenceBy(localSchema, toAdd, 'name'),
    // cloud schema, omit excess
    _.differenceBy(cloudSchema, toRemove, 'name'),
    // compare via helper function
    (targetTransition, currentTransition) => _.isEqual(
      _.omit(targetTransition, ['id']),
      _.omit(currentTransition, ['id'])
    )
  );

  return {
    toAdd,
    toRemove,
    toUpdate,
  };
}

function findTransitionByName(name: string, transitions: any[]) {
  return _.find(
    transitions,
    transition => transition.name === name
  );
}

function compareIndexes(localSchema: any, cloudSchema: any) {
  const localIndexes = localSchema?.indexes ?? [];

  /* Remove the system indexes which cannot be managed by the user */
  const indexesManagedByUser = cloudSchema.indexes
    .filter((index: any) => index.system === false)
    .map((idx: any) => ({ idx, marked: false }));

  const newIndexes: any = [];
  for (const localIndex of localIndexes) {
    let existsInCloud = false;
    for (const cloudIndex of indexesManagedByUser) {
      if (_.isEqual(_.omit(cloudIndex.idx, ['name', 'id', 'system']), _.omit({ options: {}, ...localIndex }, ['name']))) {
        existsInCloud = true;
        cloudIndex.marked = true;
        break;
      }
    }
    if (!existsInCloud) {
      newIndexes.push(localIndex);
    }
  }

  const removedIndexes = indexesManagedByUser
    .filter((index: any) => index.marked === false)
    .map((index: any) => index.idx);

  return { removedIndexes, newIndexes };
}
