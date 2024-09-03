import Ajv from 'ajv';

export enum TestId {
  META_SCHEMA = 1,
  PROPERTY_VERIFY= 2,
  INPUT_CONDITIONS= 3,
  STATUS_CHECK = 4,
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
      const errors = getIdInObjectArrayErrors(this.schema);
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
}

// The data service automatically assigns an id to all objects in an array
// This function checks if the schema has an array of objects with an id property conflicting the one from the data service
function getIdInObjectArrayErrors(configuration: any, pathPrefix = '') {
  if (!configuration) {
    return [];
  }

  const pathsWithIdInArray = [];

  // Schema or object configuration
  if (configuration.type === 'object' || isSchemaConfiguration(configuration)) {
    if (configuration.properties) {
      for (const [name, value] of Object.entries(configuration.properties)) {
        pathsWithIdInArray.push(...getIdInObjectArrayErrors(value, `${pathPrefix}properties.${name}.`));
      }
    }

    if (configuration.additionalProperties) {
      pathsWithIdInArray.push(...getIdInObjectArrayErrors(configuration.additionalProperties, `${pathPrefix}additionalProperties.`));
    }
  }

  if (configuration.type === 'array') {
    // The actual check we are looking for
    if (configuration.items.type === 'object' && configuration.items.properties?.id) {
      pathsWithIdInArray.push(`${pathPrefix}items.properties.id`);
    }

    pathsWithIdInArray.push(...getIdInObjectArrayErrors(configuration.items, `${pathPrefix}items.`));
  }

  return pathsWithIdInArray;
}

function isSchemaConfiguration(configuration: any) {
  return configuration && configuration.properties;
}
