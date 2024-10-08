import Ajv from 'ajv';
import { cloneDeep } from 'lodash';
import { SchemaVerify, TestId } from '../../../../src/commands/data/schemas/util/schemaverify';
import * as metaschema from '../../../../src/config-json-schemas/Schema.json';
import { validSchema } from '../../../__helpers__/schemas';

describe('Data - Schema - Validate', () => {
  const ajv = new Ajv();
  let schema;

  beforeEach(() => {
    schema = cloneDeep(validSchema);
  });

  it('Verifies the properties of a schemas input conditions', async () => {
    const validate = new SchemaVerify(ajv, schema, metaschema);
    const checks = validate.RunChecks();
    for (const check of checks) {
      if (check.id === TestId.INPUT_CONDITIONS) {
        expect(check.ok).toBe(true);
      }
    }

    expect.assertions(1);
  });

  it('Throws an error when using a property in a transition which is not defined in the schema properties', async () => {
    delete schema.properties.category;

    const validate = new SchemaVerify(ajv, schema, metaschema);
    const checks = validate.RunChecks();

    for (const check of checks) {
      if (check.id === TestId.INPUT_CONDITIONS) {
        expect(check.ok).toBe(false);
        expect(check.errors).toStrictEqual([
          "Transition - mark-as-analyzed : property 'category' is defined in the condition properties, but not defined in the schema properties",
        ]);
      }
    }

    expect.assertions(2);
  });

  it('Throws an error when using a property in transition with a mismatched type in the schema properties', async () => {
    schema.properties.systolic.type = 'string';

    const validate = new SchemaVerify(ajv, schema, metaschema);
    const checks = validate.RunChecks();

    for (const check of checks) {
      if (check.id === TestId.INPUT_CONDITIONS) {
        expect(check.ok).toBe(false);
        expect(check.errors).toStrictEqual([
          "Transition - creationTransition : property 'systolic.type' does not match the value found in the schema properties",
        ]);
      }
    }

    expect.assertions(2);
  });

  it('Throws an error when using a property using a property nested in multiple arrays in a transition which is not defined in the schema properties', async () => {
    delete schema.properties.comments.items.properties.staffIds;

    const validate = new SchemaVerify(ajv, schema, metaschema);
    const checks = validate.RunChecks();

    for (const check of checks) {
      if (check.id === TestId.INPUT_CONDITIONS) {
        expect(check.ok).toBe(false);
        expect(check.errors).toStrictEqual([
          "Transition - creationTransition : property 'comments.items.properties.staffIds' is defined in the condition properties, but not defined in the schema properties",
          "Transition - creationTransition : property 'comments.items.properties.staffIds.items' is defined in the condition properties, but not defined in the schema properties",
        ]);
      }
    }

    expect.assertions(2);
  });

  it('Throws an error when using a property nested in multiple arrays in transition with a mismatched type in the schema properties', async () => {
    schema.properties.comments.items.properties.staffIds.items.type = 'number';

    const validate = new SchemaVerify(ajv, schema, metaschema);
    const checks = validate.RunChecks();

    for (const check of checks) {
      if (check.id === TestId.INPUT_CONDITIONS) {
        expect(check.ok).toBe(false);
        expect(check.errors).toStrictEqual([
          "Transition - creationTransition : property 'comments.items.properties.staffIds.items.type' does not match the value found in the schema properties",
        ]);
      }
    }

    expect.assertions(2);
  });

  it('Does not throw an error when using a property named type', async () => {
    schema.creationTransition.conditions[0].configuration.properties.type = {
      type: 'string',
      enum: ['foo', 'bar'],
    };

    schema.properties.type = {
      type: 'string',
      description: 'A property with the name of type to test that it does not conflict with the properties validation',
    };

    const validate = new SchemaVerify(ajv, schema, metaschema);
    const checks = validate.RunChecks();

    for (const check of checks) {
      if (check.id === TestId.INPUT_CONDITIONS) {
        expect(check.ok).toBe(true);
      }
    }

    expect.assertions(1);
  });
});
