import Ajv from 'ajv';

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
      for (const [transition] of this.schema.transitions.entries()) {
        const result = this.validateTransition(transition, transition.name);
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

        // TODO: This could not be an object - maybe?
        const result = this.recursivelyValidateProperties(condition.configuration, '');
        result.forEach((path: string) => errors.push(`Transition - ${name} : property '${path}' is defined in conditions, but not defined in the schema properties`));
      }
    }

    return errors;
  }

  recursivelyValidateProperties(object: any, path: string) {
    const properties = object.properties || {};
    const invalidPaths = [];

    for (const key of Object.keys(properties)) {
      const { type } = properties[key];

      /**
       * Check the given property exists in the properties section of the schema
       * The path value is only supplied for nested properties e.g `diagnosis.severity`, else the property is at the root `schema.properties`
       * The reduce function is used to traverse the properties object using the path to ensure all nodes of the path exist in `schema.properties`
       */
      const propertyPath = path ? `${path}.${key}` : key;
      const value = propertyPath.split('.').reduce((property, a) => property[a], this.schema.properties);

      if (!value) {
        // TODO: Also check the property type matches
        invalidPaths.push(propertyPath);
      }

      if (type === 'object') {
        const nestedPath = path ? `${path}.${key}.properties` : `${key}.properties`;
        const result = this.recursivelyValidateProperties(properties[key], nestedPath);
        invalidPaths.push(...result);
      }

      if (type === 'array') {
        const nestedPath = path ? `${path}.${key}.items.properties` : `${key}.items.properties`;
        const result = this.recursivelyValidateProperties(properties[key].items, nestedPath);
        invalidPaths.push(...result);
      }
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
