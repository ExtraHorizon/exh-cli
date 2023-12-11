import Ajv from 'ajv';
import { isEqual } from 'lodash';

export enum TestId {
  META_SCHEMA = 1,
  PROPERTY_VERIFY= 2,
  INPUT_CONDITIONS= 3,
  STATUS_CHECK = 4,
  CONDITION_TYPES = 5,
}

interface InternalTestResult {
  ok: boolean;
  errors: any[];
}

export interface TestResult extends InternalTestResult{
  id: TestId;
  test: string;
}

function transformAjvErrors(offsetPath: string, errors: any): string[] {
  const result = {};
  for (const error of errors) {
    const path = offsetPath + error.instancePath;
    if (!result[path]) {
      result[path] = [];
    }
    result[path].push(`${error.message} ${error.params ? JSON.stringify(error.params) : ''}`);
  }
  return Object.keys(result).map(r => [r, ...result[r].map((m:any) => `\t-${m}`)]).flat();
}

export class SchemaVerify {
  private ajv: Ajv;

  private schema: any;

  private metaSchema: any;

  constructor(ajv: Ajv, schema: any, metaSchema: any) {
    this.ajv = ajv;
    this.schema = schema;
    this.metaSchema = metaSchema;
  }

  * RunChecks(): Generator<TestResult> {
    yield { id: TestId.META_SCHEMA, test: 'Check if the schema is in the correct form', ...this.#verifyMetaSchema() };
    yield { id: TestId.PROPERTY_VERIFY, test: 'Check if the properties object is valid JSON schema', ...this.#verifyProperties() };
    yield { id: TestId.INPUT_CONDITIONS, test: 'Check if all input conditions of transitions are valid JSON schema', ...this.#verifyInputConditions() };
    yield { id: TestId.STATUS_CHECK, test: 'Check if all statuses are accounted for', ...this.#verifyStatuses() };
    yield { id: TestId.CONDITION_TYPES, test: 'Check if all condition types are used in the correct transitions', ...this.#verifyConditionTypes() };
  }

  #verifyMetaSchema(): InternalTestResult {
    const validate = this.ajv.compile(this.metaSchema);
    if (!validate(this.schema)) {
      return { ok: false, errors: transformAjvErrors('', validate.errors) };
    }
    return { ok: true, errors: [] };
  }

  #verifyProperties(): InternalTestResult {
    if (this.schema.properties) {
      const tmpSchema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: this.schema.properties,
      };
      if (!this.ajv.validateSchema(tmpSchema)) {
        return { ok: false, errors: transformAjvErrors('', this.ajv.errors) };
      }
      const errors = getIdInObjectArrayErrors(this.schema.properties);
      if (errors.length > 0) {
        return { ok: false, errors: errors.map(path => `Following id property is not allowed: ${path}`) };
      }
    }

    return { ok: true, errors: [] };
  }

  /* Verify that all statuses which are used in transitions, exist in the status list */
  #verifyStatuses(): InternalTestResult {
    let ok = true;
    const errors: any[] = [];
    let statusList: Set<string> = new Set();

    if (this.schema.transitions) {
      statusList = new Set([
        ...statusList.entries(),
        ...this.schema.transitions.map((t: any) => t.fromStatuses).flat(),
        ...this.schema.transitions.map((t: any) => t.toStatus),
      ]);
    }
    if (this.schema.creationTransition) {
      statusList = new Set([...statusList.values(), this.schema.creationTransition.toStatus]);
    }

    Object.keys(this.schema.statuses || []).forEach(status => {
      if (!statusList.has(status)) {
        errors.push(`Status '${status}' is defined in the schema statuses but not used in any transition`);
        ok = false;
      }
    });

    for (const status of statusList) {
      if (this.schema.statuses[status] === undefined) {
        errors.push(`Status '${status}' is not defined in the status list`);
        ok = false;
      }
    }
    return { ok, errors };
  }

  #verifyInputConditions(): InternalTestResult {
    let ok = true;
    const errors: any[] = [];

    /* check all conditions of the creation transition */
    if (this.schema.creationTransition?.conditions?.length) {
      const schemaProperties = this.schema.properties || [];

      // Validate that all properties in the conditions are defined in the schema properties
      const transitionConditions = this.schema.creationTransition.conditions || [];
      transitionConditions.forEach(condition => {
        const conditionProperties = condition.configuration?.properties || [];

        Object.keys(conditionProperties).forEach(key => {
          // Check if the condition property is not defined in the schema properties
          if (!schemaProperties[key]) {
            errors.push(`Property '${key}' is defined in the creation transition properties but not in the schema properties`);
            ok = false;
            return;
          }

          // Check if the condition property is incorrectly typed vs the schema properties
          if (!isEqual(schemaProperties[key], conditionProperties[key])) {
            errors.push(`Property '${key}' has different type definitions in the creation transition and schema properties`);
            ok = false;
          }
        });
      });

      for (const [index, condition] of this.schema.creationTransition.conditions.entries()) {
        if (condition.type !== 'input') {
          continue;
        }
        condition.configuration.$schema = 'http://json-schema.org/draft-07/schema#';
        if (!this.ajv.validateSchema(condition.configuration)) {
          ok = false;
          errors.push(...transformAjvErrors(`/creationTransition/conditions[${index}]/configuration`, this.ajv.errors));
        }
      }
    }

    /* check all conditions of the other transitions */
    if (this.schema.transitions?.length) {
      for (const [tIndex, transition] of this.schema.transitions.entries()) {
        if (!transition.conditions) {
          continue;
        }
        for (const [cIndex, condition] of transition.conditions?.entries()) {
          if (condition.type !== 'input') {
            continue;
          }
          if (!this.ajv.validateSchema(condition.configuration)) {
            ok = false;
            errors.push(...transformAjvErrors(`/transitions[${tIndex}]/conditions[${cIndex}]/configuration`, this.ajv.errors));
          }
        }
      }
    }
    return { ok, errors };
  }

  #verifyConditionTypes(): InternalTestResult {
    let ok = true;
    const errors = [];
    /* input & initiator conditions can only be used in either the creationTransition or manual transitions */
    if (this.schema.transitions) {
      for (const [tIndex, transition] of this.schema.transitions.entries()) {
        if (transition.type === 'manual' || !transition.conditions) {
          continue;
        }
        for (const [cIndex, condition] of transition.conditions.entries()) {
          if (['input', 'initiator'].includes(condition.type)) {
            ok = false;
            errors.push(`/transitions[${tIndex}]/conditions[${cIndex}] type cannot be ${condition.type} in a non-manual transition`);
          }
        }
      }
    }
    return { ok, errors };
  }
}

// The data service automatically assigns an id to all objects in an array
// This function checks if the schema has an array of objects with an id property conflicting the one from the data service
function getIdInObjectArrayErrors(properties: any, path = []) {
  const pathsWithIdInArray = [];
  for (const [name, value] of Object.entries<any>(properties)) {
    // For all properties with type array of objects, check if they have an id property
    if (value.type === 'array' && value.items.type === 'object') {
      // Check if the array has an id property, if so add it to the list of paths
      if ('id' in value.items.properties) {
        pathsWithIdInArray.push([...path, name, 'id'].join('.'));
      }

      // Continue to check if the object in the items array has an array with an object with an id property
      pathsWithIdInArray.push(...getIdInObjectArrayErrors(value.items.properties, [...path, name]));
    }

    // Continue to check if the object has an array with an object with an id property
    if (value.type === 'object') {
      pathsWithIdInArray.push(...getIdInObjectArrayErrors(value.properties, [...path, name]));
    }
  }

  return pathsWithIdInArray;
}
