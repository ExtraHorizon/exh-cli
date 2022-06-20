import Ajv from 'ajv';
import * as metaschema from '../src/commands/data/schemas/util/metaschema.json';
import { SchemaVerify, TestId } from '../src/commands/data/schemas/util/schemaverify';

const ajv = new Ajv();

test('Empty object must trigger an error', () => {
  const verify = new SchemaVerify(ajv, { a: 1 }, metaschema);
  for (const check of verify.RunChecks()) {
    if (check.id === TestId.META_SCHEMA) {
      expect(check.ok).toBe(false);
    } else {
      expect(check.ok).toBe(true);
    }
  }
});

test('Minimal schema must not trigger an error', () => {
  const verify = new SchemaVerify(ajv, { name: 'test', description: 'test', statuses: {}, properties: {} }, metaschema);
  for (const check of verify.RunChecks()) {
    expect(check.ok).toBe(true);
  }
});

test('Invalid JSON schema in properties must trigger an error', () => {
  const verify = new SchemaVerify(ajv, { name: 'test', description: 'test', statuses: {}, properties: { foo: 'bar' } }, metaschema);
  for (const check of verify.RunChecks()) {
    if (check.id === TestId.PROPERTY_VERIFY) {
      expect(check.ok).toBe(false);
    } else {
      expect(check.ok).toBe(true);
    }
  }
});

test('Invalid JSON schema in creationTransition input condition must trigger an error', () => {
  const verify = new SchemaVerify(ajv, { name: 'test',
    description: 'test',
    statuses: { new: {} },
    creationTransition: { type: 'manual',
      toStatus: 'new',
      conditions: [
        {
          type: 'input',
          configuration: {
            type: 'test',
          },

        },
      ] },
    properties: {} }, metaschema);
  for (const check of verify.RunChecks()) {
    if (check.id === TestId.INPUT_CONDITIONS) {
      expect(check.ok).toBe(false);
    } else {
      expect(check.ok).toBe(true);
    }
  }
});
test('Valid JSON schema in creationTransition input condition must not trigger an error', () => {
  const verify = new SchemaVerify(ajv, { name: 'test',
    description: 'test',
    statuses: { new: {} },
    creationTransition: { type: 'manual',
      toStatus: 'new',
      conditions: [
        {
          type: 'input',
          configuration: {
            type: 'object',
            properties: {
              name: { type: 'string' },
            },
          },

        },
      ] },
    properties: {} }, metaschema);
  for (const check of verify.RunChecks()) {
    expect(check.ok).toBe(true);
  }
});

test('Invalid JSON schema in transition input condition must trigger an error', () => {
  const verify = new SchemaVerify(ajv, { name: 'test',
    description: 'test',
    statuses: { new: {}, processed: {} },
    transitions: [
      {
        name: 'toProcessed',
        type: 'manual',
        fromStatuses: ['new'],
        toStatus: 'processed',
        conditions: [
          {
            type: 'input',
            configuration: {
              type: 'test',
            },
          },
        ],
      },
    ],
    properties: {} }, metaschema);
  for (const check of verify.RunChecks()) {
    if (check.id === TestId.INPUT_CONDITIONS) {
      expect(check.ok).toBe(false);
    } else {
      expect(check.ok).toBe(true);
    }
  }
});

test('Valid JSON schema in transition condition must not trigger an error', () => {
  const verify = new SchemaVerify(ajv, { name: 'test',
    description: 'test',
    statuses: { new: {}, processed: {} },
    transitions: [
      {
        name: 'toProcessed',
        type: 'manual',
        fromStatuses: ['new'],
        toStatus: 'processed',
        conditions: [
          {
            type: 'input',
            configuration: {
              type: 'object',
              properties: {
                name: { type: 'string' },
              },
            },

          },
        ],
      },
    ],
    properties: {} }, metaschema);
  for (const check of verify.RunChecks()) {
    expect(check.ok).toBe(true);
  }
});

test('Using a status which is not defined should trigger an error', () => {
  /* Test for normal transition */
  const verify = new SchemaVerify(ajv, { name: 'test',
    description: 'test',
    statuses: { new: {} },
    transitions: [
      {
        name: 'toProcessed',
        type: 'manual',
        fromStatuses: ['new'],
        toStatus: 'processed',
        conditions: [],
      },
    ],
    properties: {} }, metaschema);
  for (const check of verify.RunChecks()) {
    if (check.id === TestId.STATUS_CHECK) {
      expect(check.ok).toBe(false);
    } else {
      expect(check.ok).toBe(true);
    }
  }

  /* Test in creation transition */
  const verifySecond = new SchemaVerify(
    ajv,
    { name: 'test',
      description: 'test',
      statuses: { new: {} },
      creationTransition: {
        type: 'manual',
        toStatus: 'processed',
        conditions: [],
      },
      transitions: [],
      properties: {} },
    metaschema
  );
  for (const check of verifySecond.RunChecks()) {
    if (check.id === TestId.STATUS_CHECK) {
      expect(check.ok).toBe(false);
    } else {
      expect(check.ok).toBe(true);
    }
  }
});

test('Using input conditions in non-manual transitions must give an error', () => {
  const verify = new SchemaVerify(ajv, { name: 'test',
    description: 'test',
    statuses: { new: {}, processed: {} },
    transitions: [
      {
        name: 'toProcessed',
        type: 'automatic',
        fromStatuses: ['new'],
        toStatus: 'processed',
        conditions: [
          {
            type: 'input',
            configuration: {
              type: 'object',
            },
          },
        ],
      },
    ],
    properties: {} }, metaschema);
  for (const check of verify.RunChecks()) {
    if (check.id === TestId.CONDITION_TYPES) {
      expect(check.ok).toBe(false);
    } else {
      expect(check.ok).toBe(true);
    }
  }
});
