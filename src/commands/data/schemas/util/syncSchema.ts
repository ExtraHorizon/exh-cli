/* eslint-disable lines-between-class-members */
import chalk = require('chalk');
import * as _ from 'lodash';
import * as schemaRepository from '../../../../repositories/schemas';
import { compareStatuses, calculateStatusUpdateData } from '../sync/statusHelpers';

export class SyncSchema {
  private sdk: any;
  private dry: boolean;
  private cloudSchema: any = null;
  private localSchema: any = null;

  static createSchemaSync(sdk: any, dry?: boolean): SyncSchema {
    return new SyncSchema(sdk, dry);
  }

  constructor(sdk: any, dry?: boolean) {
    this.sdk = sdk;
    this.dry = dry;
  }

  async sync(target: any) {
    this.localSchema = target;

    if (!this.localSchema.name) {
      console.log('No schema name defined, skipping this file');
      return;
    }

    console.log(`Syncing ${this.localSchema.name}`);
    this.cloudSchema = await schemaRepository.fetchSchemaByName(this.sdk, this.localSchema.name);

    if (!this.cloudSchema) {
      if (this.dry) {
        console.log(`\t-> Will be created: ${chalk.green(this.localSchema.name)}`);
        return;
      }
      this.cloudSchema = await schemaRepository.createSchema(this.sdk, this.localSchema.name, this.localSchema.description);
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

    if (this.dry) {
      reportRootAttributesChanges(this.cloudSchema, diff);
      return;
    }

    if (Object.keys(diff).length > 0) {
      await schemaRepository.updateSchema(this.sdk, this.cloudSchema.id, diff);
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
    const propertiesDiff = compareSchemaKey(this.localSchema, this.cloudSchema, 'properties');

    if (this.dry) {
      reportSchemaChanges(`Schema ${this.cloudSchema.name} - Properties`, propertiesDiff);
      return;
    }

    const { toAdd, toRemove, toUpdate } = propertiesDiff;
    //  add missing
    for (const key of toAdd) {
      console.log(`properties: adding ${key}`);
      await schemaRepository.createProperty(this.sdk, this.cloudSchema.id, {
        name: key,
        configuration: this.localSchema.properties[key],
      });
    }

    //  update existing where needed
    for (const key of toUpdate) {
      console.log(`properties: updating ${key}`);
      await schemaRepository.updateProperty(
        this.sdk,
        this.cloudSchema.id,
        key,
        this.localSchema.properties[key]
      );
    }

    //  delete excess
    for (const key of toRemove) {
      console.log(`properties: removing ${key}`);
      await schemaRepository.deleteProperty(this.sdk, this.cloudSchema.id, key);
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
    const changes = compareStatuses(this.localSchema, this.cloudSchema);

    if (this.dry) {
      reportSchemaChanges(`Schema ${this.cloudSchema.name} - Statuses`, changes);
      return;
    }

    const { toAdd, toUpdate } = changes;

    for (const key of toAdd) {
      console.log(`statuses: adding ${key}`);
      await schemaRepository.createStatus(this.sdk, this.cloudSchema.id, key, this.localSchema.statuses[key]);
    }

    for (const key of toUpdate) {
      console.log(`statuses: updating ${key}`);
      const data = calculateStatusUpdateData(this.localSchema.statuses[key], this.cloudSchema.statuses[key]);
      await schemaRepository.updateStatus(this.sdk, this.cloudSchema.id, key, data);
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
      if (this.dry) {
        console.log('Update creation transition');
        return;
      }

      console.log('creation transition: updating');
      await schemaRepository.updateCreationTransition(this.sdk, this.cloudSchema.id, this.localSchema.creationTransition);
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
    const transitionsDiff = compareSchemaKey(this.localSchema, this.cloudSchema, 'transitions');

    if (this.dry) {
      reportSchemaChanges(`Schema ${this.cloudSchema.name} - Transitions`, transitionsDiff);
      return;
    }

    const { toAdd, toRemove, toUpdate } = transitionsDiff;
    for (const transition of toAdd) {
      console.log(`transitions: adding ${transition.name}`);
      await schemaRepository.createTransition(this.sdk, this.cloudSchema.id, transition);
    }

    for (const transition of toUpdate) {
      console.log(`transitions: updating ${transition.name}`);
      const currentTransition = findTransitionByName(transition.name, this.cloudSchema.transitions);
      await schemaRepository.updateTransition(this.sdk, this.cloudSchema.id, currentTransition.id, transition);
    }

    for (const transition of toRemove) {
      console.log(`transitions: removing ${transition.name}`);
      await schemaRepository.deleteTransition(this.sdk, this.cloudSchema.id, transition.id);
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
    if (this.dry) {
      // Logging of removed statuses is done in #updateStatuses
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
      await schemaRepository.deleteStatus(this.sdk, this.cloudSchema.id, key);
    }
  }

  async #syncIndexes() {
    const { newIndexes, removedIndexes } = compareIndexes(this.localSchema, this.cloudSchema);

    if (this.dry) {
      reportIndexChanges(this.localSchema, { newIndexes, removedIndexes });
      return;
    }

    /*  Delete indexes to be deleted */
    for (const idx of removedIndexes) {
      console.log(`Indexes: remove index ${idx.id}`);
      await schemaRepository.deleteIndex(this.sdk, this.cloudSchema.id, idx.id);
    }

    /* Create new indexes */
    for (const idx of newIndexes) {
      console.log('\t-> Creating new index');
      await schemaRepository.createIndex(this.sdk, this.cloudSchema.id, idx);
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

function reportRootAttributesChanges(cloudSchema: any, updatedValues: any) {
  const changedKeys = Object.keys(updatedValues);

  console.group(`Schema ${cloudSchema.name} - Root attributes`);

  if (changedKeys.length < 1) {
    console.log('No update required.');
    return;
  }

  changedKeys.forEach(key => {
    console.log(`${chalk.yellow(key)}:\t ${chalk.red(cloudSchema[key])} => ${chalk.green(updatedValues[key])}`);
  });

  console.groupEnd();
}

export type Changes = { toAdd: string[]; toRemove: string[]; toUpdate: string[]; }

function reportSchemaChanges(group: string, changes: Changes) {
  const { toAdd, toRemove, toUpdate } = changes;

  console.group(group);

  if (!toAdd.length && !toRemove.length && !toUpdate.length) {
    console.log('No update required');
    return;
  }

  // Report changes to the schema
  toAdd.forEach(key => console.log(`Will be added: ${chalk.green(getIdentifier(key))}`));
  toRemove.forEach(key => console.log(`Will be removed: ${chalk.red(getIdentifier(key))}`));
  toUpdate.forEach(key => console.log(`Will be updated: ${chalk.yellow(getIdentifier(key))}`));

  console.groupEnd();
}

type IndexChanges = { newIndexes: any[]; removedIndexes: any[]; }

function reportIndexChanges(schema: any, indexChanges: IndexChanges) {
  const { newIndexes, removedIndexes } = indexChanges;

  const changes = compareArraysByName(newIndexes, removedIndexes);

  reportSchemaChanges(`Schema ${schema.name} - Indexes`, {
    toAdd: changes.toAdd.map(v => v.name),
    toRemove: changes.toRemove.map(v => v.name),
    toUpdate: changes.toUpdate.map(v => v.name),
  });
}

export function compareSchemaKey(localSchema: any, cloudSchema: any, key: string) {
  if (!localSchema[key] && !cloudSchema[key]) {
    return {
      toAdd: [],
      toRemove: [],
      toUpdate: [],
    };
  }

  const isLocalPropertyArray = Array.isArray(localSchema[key]);
  const isCloudPropertyArray = !localSchema[key] && Array.isArray(cloudSchema[key]);

  if (isLocalPropertyArray || isCloudPropertyArray) {
    return compareArraysByName(localSchema[key], cloudSchema[key]);
  }

  return compareSchemas(localSchema[key], cloudSchema[key]);
}

function compareSchemas(localSchema: any, cloudSchema: any) {
  // Calculate the properties of the schemas that have been added or removed
  const toAdd = _.difference(Object.keys(localSchema), Object.keys(cloudSchema));
  const toRemove = _.difference(Object.keys(cloudSchema), Object.keys(localSchema));

  const existingLocalProperties = _(localSchema).omit(toAdd).value();
  const existingCloudProperties = _(cloudSchema).omit(toRemove).value();
  const schemaDiff = deepDiff(existingLocalProperties, existingCloudProperties);

  const toUpdate = Object.keys(schemaDiff);

  return {
    toAdd,
    toRemove,
    toUpdate,
  };
}

function compareArraysByName(localSchema: any[], cloudSchema: any[]) {
  const toAdd: any[] = _.differenceBy(localSchema, cloudSchema, 'name');
  const toRemove: any[] = _.differenceBy(cloudSchema, localSchema, 'name');

  /*
    Looks at an array of local schemas and an array of cloud schemas, filters out any schema that doesn't exist in both array,
    and then compares the remaining schemas in the arrays. A local schema will be compared to the cloud schema with the same name
  */
  const existingLocalProperties = _.differenceBy(localSchema, toAdd, 'name');
  const existingCloudProperties = _.differenceBy(cloudSchema, toRemove, 'name');
  const toUpdate: any[] = _.differenceWith(
    existingLocalProperties,
    existingCloudProperties,
    (targetSchema, currentSchema) => _.isEqual(
      _.omit(targetSchema, ['id']),
      _.omit(currentSchema, ['id'])
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
      const cloudIndexContents = _.omit(cloudIndex.idx, ['name', 'id', 'system']);
      const localIndexContents = _.omit({ options: {}, ...localIndex }, ['name']);

      if (_.isEqual(cloudIndexContents, localIndexContents)) {
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

function getIdentifier(value: any) {
  if (typeof value !== 'object') {
    return value;
  }
  if (value.id) {
    return value.id;
  }
  return value.name;
}
