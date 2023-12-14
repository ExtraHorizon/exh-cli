import Ajv from 'ajv';

export enum TestId {
  META_SCHEMA = 1,
  PROPERTY_VERIFY= 2,
  INPUT_CONDITIONS= 3,
  STATUS_CHECK = 4,
  CONDITION_TYPES = 5,
  TRANSITION_NAMES = 6,
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
    yield { id: TestId.TRANSITION_NAMES, test: 'Check if all transition names are unique', ...this.#verifyTransitionNames() };
  }

  #verifyMetaSchema(): InternalTestResult {
    const validate = this.ajv.compile(this.metaSchema);
    if (!validate(this.schema)) {
      return { ok: false, errors: transformAjvErrors('', validate.errors) };
    }
    return { ok: true, errors: [] };
  }

  #verifyTransitionNames(): InternalTestResult {
    const transitionNames = new Set();
    const nonUniqueNames = new Set();

    for (const transition of (this.schema.transitions || [])) {
      const { name } = transition;

      if (transitionNames.has(name)) {
        nonUniqueNames.add(name);
      } else {
        transitionNames.add(name);
      }
    }

    return { ok: nonUniqueNames.size === 0, errors: [...nonUniqueNames].map(name => `Transition name '${name}' is not unique`) };
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
        return { ok: false, errors: errors.map(path => `The following id property is not allowed: ${path}`) };
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

    /* Validate conditions of the creation transition */
    if (this.schema.creationTransition?.conditions?.length) {
      const result = this.validateTransition(this.schema.creationTransition, 'creationTransition');
      errors.push(...result);
    }

    /* Validate conditions of the other transitions */
    if (this.schema.transitions?.length) {
      for (const transition of this.schema.transitions) {
        const result = this.validateTransition(transition, `${transition.name}`);
        errors.push(...result);
      }
    }

    if (errors.length) {
      ok = false;
    }

    return { ok, errors };
  }

  validateTransition(transition: any, name: string) {
    const errors = [];
    const conditions = transition.conditions || [];

    for (const [index, condition] of Object.entries<any>(conditions)) {
      if (condition.type === 'input') {
        condition.configuration.$schema = 'http://json-schema.org/draft-07/schema#';

        const isValidConfiguration = this.ajv.validateSchema(condition.configuration);
        if (!isValidConfiguration) {
          errors.push(...transformAjvErrors(`/creationTransition/conditions[${index}]/configuration`, this.ajv.errors));
        }

        const result = this.validateConditionPropertiesAgainstSchemaProperties(condition.configuration.properties, this.schema.properties, '');
        result.forEach((error: string) => errors.push(`Transition - ${name} : property ${error}`));
      }
    }

    return errors;
  }

  validateConditionPropertiesAgainstSchemaProperties(conditionProperties: any, schemaProperties: any, path: string) {
    const invalidPaths = new Set([]);

    // If the provided source object is not an object the property tree has been exhausted, thus return
    if (typeof conditionProperties !== 'object') {
      return invalidPaths;
    }

    for (const key of Object.keys(conditionProperties)) {
      const conditionProperty = conditionProperties[key];
      const schemaProperty = schemaProperties?.[key];

      /**
       * If the source key is type and the value is a string we have reached a type definition
       * If the property is not a string most likely the user has defined a property with the name of type
       */
      if (key === 'type' && typeof conditionProperty === 'string') {
        // If the type property exists at the given path in the target, check if the types match
        if (schemaProperty && conditionProperty !== schemaProperty) {
          invalidPaths.add(`'${path}.type' does not match the value found in the schema properties`);
        }

        // If the type property does not exist at the target path, throw an error
        if (!schemaProperty) {
          invalidPaths.add(`'${path}' is defined in the condition properties, but not defined in the schema properties`);
        }
      }

      const currentPath = path ? `${path}.${key}` : key;
      const result = this.validateConditionPropertiesAgainstSchemaProperties(conditionProperty, schemaProperty, currentPath);
      result.forEach(error => invalidPaths.add(error));
    }

    return invalidPaths;
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
  let name;
  let value;

  for ([name, value] of Object.entries<any>(properties)) {
    // Keep going deeper into the schema until the next value is no longer an array
    while (value.type === 'array' && value.items.type === 'array') {
      value = value.items;
      name = `${name}.items`;
    }

    // For all properties with type array of objects, check if they have an id property
    if (value.type === 'array' && value.items.type === 'object') {
      // Check if the array has an id property, if so add it to the list of paths
      if ('id' in value.items.properties) {
        pathsWithIdInArray.push([...path, `${name}.items.properties`, 'id'].join('.'));
      }

      // Continue to check if the object in the items array has an array with an object with an id property
      pathsWithIdInArray.push(...getIdInObjectArrayErrors(value.items.properties, [...path, `${name}.items.properties`]));
    }

    // Continue to check if the object has an array with an object with an id property
    if (value.type === 'object') {
      pathsWithIdInArray.push(...getIdInObjectArrayErrors(value.properties, [...path, `${name}.properties`]));
    }
  }

  return pathsWithIdInArray;
}
