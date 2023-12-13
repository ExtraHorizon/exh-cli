import Ajv from 'ajv';
import * as metaschema from '../../../src/commands/data/schemas/util/metaschema.json';
import { SchemaVerify, TestId } from '../../../src/commands/data/schemas/util/schemaverify';
import { validSchema } from '../../__helpers__/schemas';

describe('Data - Schema - Validate', () => {
  const ajv = new Ajv();

  it('Verifies a Schema', async () => {
    const validate = new SchemaVerify(ajv, validSchema, metaschema);
    const checks = validate.RunChecks();
    for (const check of checks) {
      if (check.id === TestId.INPUT_CONDITIONS) {
        expect(check.ok).toBe(true);
      }
    }
  });

  it('Throws an error when using a property in a transition which is not defined in the schema properties', async () => {
    delete validSchema.properties.category;

    const validate = new SchemaVerify(ajv, validSchema, metaschema);
    const checks = validate.RunChecks();

    for (const check of checks) {
      if (check.id === TestId.INPUT_CONDITIONS) {
        expect(check.ok).toBe(false);
        expect(check.errors).toStrictEqual([
          "Transition - transitions.mark-as-analyzed : property 'category' is defined in conditions, but not defined in the schema properties",
        ]);
      }
    }
  });

  it('Throws an error when using a property in transition with a mismatched type in the schema properties', async () => {
    validSchema.properties.systolic.type = 'string';

    const validate = new SchemaVerify(ajv, validSchema, metaschema);
    const checks = validate.RunChecks();

    for (const check of checks) {
      if (check.id === TestId.INPUT_CONDITIONS) {
        expect(check.ok).toBe(false);
        expect(check.errors).toStrictEqual([
          "Transition - creationTransition : property 'systolic.type' is defined in both conditions and properties but is of the incorrect type",
        ]);
      }
    }
  });

  it('Does not throw an error when using a property named type', async () => {
    validSchema.creationTransition.conditions[0].configuration.properties.type = {
      type: 'string',
      enum: ['foo', 'bar'],
    };

    validSchema.properties.type = {
      type: 'string',
      description: 'A property with the name of type to test that it does not conflict with the properties validation',
    };

    const validate = new SchemaVerify(ajv, validSchema, metaschema);
    const checks = validate.RunChecks();

    for (const check of checks) {
      if (check.id === TestId.INPUT_CONDITIONS) {
        expect(check.ok).toBe(true);
      }
    }
  });
});
