import * as _ from 'lodash';
import {
  createSchema,
  fetchSchemaByName,
  updateSchema,
  createProperty,
  updateProperty,
  deleteProperty,
  createStatus,
  updateStatus,
  deleteStatus,
  updateCreationTransition,
  createTransition,
  updateTransition,
  deleteTransition
} from './dataService';

export async function syncSchema(targetSchema) {
  if(!targetSchema.name){
    console.log(`No schema name defined, skipping this file`);
    return;
  }
  console.log(`syncing ${targetSchema.name}`);
  
  let currentSchema = await fetchSchemaByName(targetSchema.name);

  if (!currentSchema) {
    currentSchema = await createSchema(targetSchema.name, targetSchema.description);
  }

  //  root attributes: update
  await syncRootAttributes(currentSchema, targetSchema);

  //  properties: add, update & remove
  targetSchema.properties ? await syncProperties(currentSchema, targetSchema) : console.log(`Skipping properties: No properties defined in local ${targetSchema.name} schema`);

  //  statuses 1/2: add & update
  targetSchema.statuses ? await updateStatuses(currentSchema, targetSchema) : console.log(`Skipping statuses: No statuses defined in local ${targetSchema.name} schema`);

  //  creationTransition: update
  targetSchema.creationTransition ? await syncCreationTransition(currentSchema, targetSchema) : console.log(`Skipping creationTransition: No creationTransition defined in local ${targetSchema.name} schema`);
 
  // transtions: add, update & remove
  targetSchema.transitions ? await syncTransitions(currentSchema, targetSchema) : console.log(`Skipping transitions: No transitions defined in local ${targetSchema.name} schema`);

  //  statuses 2/2 remove
  if(targetSchema.statuses) await pruneStatuses(currentSchema, targetSchema);
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
async function syncRootAttributes(currentSchema, targetSchema) {
  const diff = deepDiff(
    _.pick(targetSchema, 'description', 'defaultLimit', 'maximumLimit', 'createMode', 'readMode', 'updateMode', 'groupSyncMode'),
    _.pick(currentSchema, 'description', 'defaultLimit', 'maximumLimit', 'createMode', 'readMode', 'updateMode', 'groupSyncMode'));

  if (Object.keys(diff).length > 0) {
    await updateSchema(currentSchema.id, diff);
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
async function syncProperties(currentSchema, targetSchema) {
  // calculate missing
  const missingProperties = _.difference(
    Object.keys(targetSchema.properties),
    Object.keys(currentSchema.properties));
  
  // calculate excess
  const excessProperties = _.difference(
    Object.keys(currentSchema.properties),
    Object.keys(targetSchema.properties));

  // calculate mismatch
  const incorrectProperties:any = deepDiff(
    _(targetSchema.properties).omit(missingProperties).value(),
    _(currentSchema.properties).omit(excessProperties).value());
 
  //  add missing
  for (const key of missingProperties) {
    console.log(`properties: adding ${key}`);
    await createProperty(currentSchema.id, {
      name: key,
      configuration: targetSchema.properties[key]
    });
  }

  //  update existing where needed
  for (const key in incorrectProperties) {
    console.log(`properties: updating ${key}`);
    await updateProperty(currentSchema.id, key, targetSchema.properties[key]);
  }

  //  delete excess
  for (const key of excessProperties) {
    console.log(`properties: removing ${key}`);
    await deleteProperty(currentSchema.id, key);
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
async function updateStatuses(currentSchema, targetSchema) {
  // add missing
  const missingStatuses = _.difference(
    Object.keys(targetSchema.statuses),
    Object.keys(currentSchema.statuses));


  for (const key of missingStatuses) {
    console.log(`statuses: adding ${key}`);
    await createStatus(currentSchema.id, key, targetSchema.statuses[key]);
  }

  // update existing statuses where needed
  const incorrectStatuses:any = deepDiff(
    _.omit(targetSchema.statuses, missingStatuses),
    currentSchema.statuses);

  for (const key in incorrectStatuses) {
    console.log(`statuses: updating ${key}`);
    await updateStatus(currentSchema.id, key, targetSchema.statuses[key]);
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
async function syncCreationTransition(currentSchema, targetSchema) {
  if (!_.isEqual(currentSchema.creationTransition, targetSchema.creationTransition)) {
    console.log(`creation transition: updating`);
    await updateCreationTransition(currentSchema.id, targetSchema.creationTransition);
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
async function syncTransitions(currentSchema, targetSchema) {
  // evaluate missing
  const missingTransitions:any = _.differenceBy(
    targetSchema.transitions,
    currentSchema.transitions,
    'name');
  
  //evaluate excess
  const excessTransitions:any = _.differenceBy(
    currentSchema.transitions,
    targetSchema.transitions,
    'name');
  
  // evaluate incorrect - helper comparison
  const compareTransitions = (targetTransition, currentTransition) => {
    return _.isEqual(
      targetTransition,
      _.omit(currentTransition, ['id'])); //(ignore auto-generated id in comparison)
  };

  // evaluate incorrect
  const incorrectTransitions:any = _.differenceWith(
    // targets, omit missing
    _.differenceBy(targetSchema.transitions, missingTransitions, 'name'),
    // current, omit excess
    _.differenceBy(currentSchema.transitions, excessTransitions, 'name'),
    // compare via helper function
    compareTransitions
  );
  

  //  add missing
  for (const targetTransition of missingTransitions) {
    console.log(`transitions: adding ${targetTransition.name}`);
    await createTransition(currentSchema.id, targetTransition);
  }

  // update - helper function
  const findTransitionByName = (name) => _.find(
    currentSchema.transitions,
    (transition) => transition.name == name);

  //  update existing where necessary
  for (const targetTransition of incorrectTransitions) {
    console.log(`transitions: updating ${targetTransition.name}`);
    const currentTransition = findTransitionByName(targetTransition.name);
    await updateTransition(currentSchema.id, currentTransition.id, targetTransition);
  }

  //  delete excess
  for (const currentTransition of excessTransitions) {
    console.log(`transitions: removing ${currentTransition.name}`);
    await deleteTransition(currentSchema.id, currentTransition.id);
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
async function pruneStatuses(currentSchema, targetSchema) {
  //calculate excess statuses
  const excessStatuses = _.difference(
    Object.keys(currentSchema.statuses),
    Object.keys(targetSchema.statuses));
  //  delete excess statuses
  for (const key of excessStatuses) {
    console.log(`statuses: removing ${key}`);
    await deleteStatus(currentSchema.id, key);
  }
}


/**
 * Deep difference between two objects
 * @todo include a step that goes into arrays?
 * @param  {object} object object compared
 * @param  {object} other  object whose matching values are excluded
 * @return {object}        Returns a new object representing the difference
 */
function deepDiff(object, other) {
  // transform iterates over object
  return _.transform(object, (result, value, key) => {
    // compare to value in other object at same key
    if (!_.isEqual(value, other[key])) {
      //check if recursion is neccessary
      result[key] = _.isObject(value) && _.isObject(other[key]) ? deepDiff(value, other[key]) : value;
    }
  });
}