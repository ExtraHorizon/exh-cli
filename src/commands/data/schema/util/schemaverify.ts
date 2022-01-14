import Ajv from 'ajv';

export interface TestResult {
  test?: string;
  ok: boolean;
  errors: any[];
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
    yield { test: 'Check if the schema is in the correct form', ...this.#verifyMetaSchema() };
    yield { test: 'Check if the properties object is valid JSON schema', ...this.#verifyProperties() };
    yield { test: 'Check if all input conditions of transitions are valid JSON schema', ...this.#verifyInputConditions() };
    yield { test: 'Check if all statuses are accounted for', ...this.#verifyStatuses() };
    yield { test: 'Check if all condition types are used in the correct transitions', ...this.#verifyConditionTypes() };
  }

  #verifyMetaSchema(): TestResult {
    const validate = this.ajv.compile(this.metaSchema);
    if (!validate(this.schema)) {
      return { ok: false, errors: transformAjvErrors('', validate.errors) };
    }
    return { ok: true, errors: [] };
  }

  #verifyProperties(): TestResult {
    if (this.schema.properties) {
      const tmpSchema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: this.schema.properties,
      };
      if (!this.ajv.validateSchema(tmpSchema)) {
        return { ok: false, errors: this.ajv.errors };
      }
    }
    return { ok: true, errors: [] };
  }

  /* Verify that all statuses which are used in transitions, exist in the status list */
  #verifyStatuses(): TestResult {
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
    for (const status of statusList) {
      if (this.schema.statuses[status] === undefined) {
        errors.push(`Status '${status}' is not defined in the status list`);
        ok = false;
      }
    }
    return { ok, errors };
  }

  #verifyInputConditions(): TestResult {
    let ok = true;
    const errors: any[] = [];

    /* check all conditions of the creation transition */
    if (this.schema.creationTransition?.conditions?.length) {
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

  #verifyConditionTypes(): TestResult {
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
