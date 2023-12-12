import Ajv from 'ajv';
import * as metaschema from '../../../src/commands/data/schemas/util/metaschema.json';
import { SchemaVerify, TestId } from '../../../src/commands/data/schemas/util/schemaverify';
import { schema } from '../../__helpers__/schemas';

describe('Data - Schema - Validate', () => {
  const ajv = new Ajv();

  it('Verifies a Schema', async () => {
    const validate = new SchemaVerify(ajv, schema, metaschema);
    const checks = validate.RunChecks();
    for (const check of checks) {
      if (check.id === 3) {
        console.log(check);
      }
    }
  });

  it('Has a bad property', async () => {
    delete schema.properties.notes.items.properties.staff.items.properties.staffId;
    const validate = new SchemaVerify(ajv, schema, metaschema);
    const checks = validate.RunChecks();
    for (const check of checks) {
      if (check.id === TestId.INPUT_CONDITIONS) {
        expect(check.ok).toBe(false);
        expect(check.errors).toStrictEqual([
          'Transition - creationTransition : property \'notes.items.properties.staff.items.properties.staffId\' is defined in conditions, but not defined in the schema properties',
        ]);
      }
    }
  });

  it('Is missing properties', async () => {
    delete schema.properties.notes.items.properties.staff.items.properties;
    const validate = new SchemaVerify(ajv, schema, metaschema);
    const checks = validate.RunChecks();
    for (const check of checks) {
      if (check.id === TestId.INPUT_CONDITIONS) {
        expect(check.ok).toBe(false);
        expect(check.errors).toStrictEqual([
          "Transition - creationTransition : property 'notes.items.properties.staff.items.properties' is defined in conditions, but not defined in the schema properties",
          "Transition - creationTransition : property 'notes.items.properties.staff.items.properties.staffId' is defined in conditions, but not defined in the schema properties",
          "Transition - creationTransition : property 'notes.items.properties.staff.items.properties.lastName' is defined in conditions, but not defined in the schema properties",
        ]);
      }
    }
  });

  it('Is not a valid metaschema', async () => {
    const yes = schema.creationTransition.conditions[0].configuration;
    console.log(yes);
    delete schema.creationTransition.conditions[0].configuration;
    const validate = new SchemaVerify(ajv, schema, metaschema);
    const checks = validate.RunChecks();
    for (const check of checks) {
      if (check.id === TestId.INPUT_CONDITIONS) {
        expect(check.ok).toBe(false);
        expect(check.errors).toStrictEqual([
          "Transition - creationTransition : property 'notes.items.properties.staff.items.properties' is defined in conditions, but not defined in the schema properties",
          "Transition - creationTransition : property 'notes.items.properties.staff.items.properties.staffId' is defined in conditions, but not defined in the schema properties",
          "Transition - creationTransition : property 'notes.items.properties.staff.items.properties.lastName' is defined in conditions, but not defined in the schema properties",
        ]);
      }
    }
  });
});
