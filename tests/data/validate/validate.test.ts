import Ajv from 'ajv';
import * as metaschema from '../../../src/commands/data/schemas/util/metaschema.json';
import { SchemaVerify } from '../../../src/commands/data/schemas/util/schemaverify';
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
});
