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
  const verify = new SchemaVerify(ajv, { name: 'test', description: 'test', statuses: { new: {} }, properties: {}, creationTransition: { type: 'manual', toStatus: 'new' } }, metaschema);
  for (const check of verify.RunChecks()) {
    expect(check.ok).toBe(true);
  }
});

test('Creation transition is mandatory', () => {
  const verify = new SchemaVerify(ajv, { name: 'test', description: 'test', statuses: { }, properties: {} }, metaschema);
  for (const check of verify.RunChecks()) {
    if (check.id === TestId.META_SCHEMA) {
      expect(check.ok).toBe(false);
    } else {
      expect(check.ok).toBe(true);
    }
  }
});

test('Invalid JSON schema in properties must trigger an error', () => {
  const verify = new SchemaVerify(ajv, { name: 'test', description: 'test', statuses: { new: {} }, properties: { foo: 'bar' }, creationTransition: { type: 'manual', toStatus: 'new' } }, metaschema);
  for (const check of verify.RunChecks()) {
    if (check.id === TestId.PROPERTY_VERIFY) {
      expect(check.ok).toBe(false);
    } else {
      expect(check.ok).toBe(true);
    }
  }
});

test('Invalid JSON schema in creationTransition input condition must trigger an error', () => {
  const schema = {
    name: 'test',
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
    properties: {},
  };
  const verify = ajv.compile(metaschema);
  expect(verify(schema)).toBe(false);
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
    properties: { name: { type: 'string' } } }, metaschema);
  for (const check of verify.RunChecks()) {
    expect(check.ok).toBe(true);
  }
});

test('An item of an array with an id should error', () => {
  const verify = new SchemaVerify(ajv, { name: 'test',
    description: 'test',
    statuses: { new: {} },
    creationTransition: { },
    properties: { name: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
        },
      },
    } } }, metaschema);

  for (const check of verify.RunChecks()) {
    if (check.id === TestId.PROPERTY_VERIFY) {
      expect(check.ok).toBe(false);
      expect(check.errors).toStrictEqual(['The following id property is not allowed: name.items.properties.id']);
    }
  }

  expect.assertions(2);
});

test('An item of a nested array with an id should error', () => {
  const verify = new SchemaVerify(ajv, { name: 'test',
    description: 'test',
    statuses: { new: {} },
    creationTransition: { },
    properties: { name: {
      type: 'array',
      items: { type: 'array',
        items: { type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
              },
            },
          } } },
    } } }, metaschema);

  for (const check of verify.RunChecks()) {
    if (check.id === TestId.PROPERTY_VERIFY) {
      expect(check.ok).toBe(false);
      expect(check.errors).toStrictEqual(['The following id property is not allowed: name.items.items.items.properties.id']);
    }
  }

  expect.assertions(2);
});

test('An item of an array in a sub property with an id should error', () => {
  const verify = new SchemaVerify(ajv, { name: 'test',
    description: 'test',
    statuses: { new: {} },
    creationTransition: { },
    properties: { name: {
      type: 'object',
      properties: { subname: { type: 'array',
        items: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
          },
        } } },
    } } }, metaschema);

  for (const check of verify.RunChecks()) {
    if (check.id === TestId.PROPERTY_VERIFY) {
      expect(check.ok).toBe(false);
      expect(check.errors).toStrictEqual(['The following id property is not allowed: name.properties.subname.items.properties.id']);
    }
  }

  expect.assertions(2);
});

test('A deeply nested item in array property with an id should error', () => {
  const verify = new SchemaVerify(ajv, { name: 'test',
    description: 'test',
    statuses: { new: {} },
    creationTransition: { },
    properties: { name: {
      type: 'array',
      items: {
        type: 'object',
        properties: { subname: { type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
              },
            },
          } } },
      },
    } } }, metaschema);

  for (const check of verify.RunChecks()) {
    if (check.id === TestId.PROPERTY_VERIFY) {
      expect(check.ok).toBe(false);
      expect(check.errors).toStrictEqual(['The following id property is not allowed: name.items.properties.subname.items.properties.id']);
    }
  }

  expect.assertions(2);
});

test('An item of an array with an id should error for all properties', () => {
  const verify = new SchemaVerify(ajv, { name: 'test',
    description: 'test',
    statuses: { new: {} },
    creationTransition: { },
    properties: { firstProperty: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
        },
      },
    },

    secondProperty: {
      type: 'string',
    },

    thirdProperty: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
        },
      },

    } } }, metaschema);

  for (const check of verify.RunChecks()) {
    if (check.id === TestId.PROPERTY_VERIFY) {
      expect(check.ok).toBe(false);
      expect(check.errors).toStrictEqual([
        'The following id property is not allowed: firstProperty.items.properties.id',
        'The following id property is not allowed: thirdProperty.items.properties.id',
      ]);
    }
  }

  expect.assertions(2);
});

test('Valid JSON schema in transition condition must not trigger an error', () => {
  const verify = new SchemaVerify(ajv, { name: 'test',
    description: 'test',
    statuses: { new: {}, processed: {} },
    creationTransition: { type: 'manual', toStatus: 'new' },
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

test('Invalid JSON schema in transition input condition must trigger an error', () => {
  const schema = {
    name: 'test',
    description: 'test',
    statuses: { new: {}, processed: {} },
    creationTransition: { type: 'manual', toStatus: 'new' },
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
    properties: {},
  };
  const verify = ajv.compile(metaschema);
  expect(verify(schema)).toBe(false);
});

test('Using a status which is not defined in a transition should trigger an error', () => {
  /* Test for normal transition */
  const verify = new SchemaVerify(ajv, { name: 'test',
    description: 'test',
    statuses: { new: {}, dazed: {}, confused: {} },
    creationTransition: { type: 'manual', toStatus: 'new' },
    transitions: [
      {
        name: 'toDazed',
        type: 'automatic',
        fromStatuses: ['new'],
        toStatus: 'dazed',
        conditions: [],
      },
    ],
    properties: {} }, metaschema);

  for (const check of verify.RunChecks()) {
    if (check.id === TestId.STATUS_CHECK) {
      expect(check.ok).toBe(false);
      expect(check.errors).toEqual(["Status 'confused' is defined in the schema statuses but not used in any transition"]);
    }
  }
});

test('Using a property in the creationTransition which is not defined in the schema properties should trigger an error', () => {
  const verify = new SchemaVerify(ajv, { name: 'test',
    description: 'test',
    statuses: { created: {} },
    creationTransition: { type: 'manual',
      toStatus: 'created',
      conditions: [
        {
          type: 'input',
          configuration: {
            properties: {
              tags: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
            },
          },
        },
      ] },
    properties: {} }, metaschema);

  for (const check of verify.RunChecks()) {
    if (check.id === TestId.INPUT_CONDITIONS) {
      if (check.id === TestId.INPUT_CONDITIONS) {
        expect(check.ok).toBe(false);
        expect(check.errors).toEqual(["Property 'tags' is defined in the creation transition properties but not in the schema properties"]);
      } else {
        expect(check.ok).toBe(true);
      }
    }
  }
});

test('Using a property in the creationTransition which is differently typed in the schema properties should trigger an error', () => {
  const verify = new SchemaVerify(ajv, { name: 'test',
    description: 'test',
    statuses: { created: {} },
    creationTransition: { type: 'manual',
      toStatus: 'created',
      conditions: [
        {
          type: 'input',
          configuration: {
            properties: {
              tags: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
            },
          },
        },
      ] },
    properties: {
      tags: {
        type: 'array',
        items: {
          type: 'number',
        },
      },
    } }, metaschema);

  for (const check of verify.RunChecks()) {
    if (check.id === TestId.INPUT_CONDITIONS) {
      if (check.id === TestId.INPUT_CONDITIONS) {
        expect(check.ok).toBe(false);
        expect(check.errors).toEqual(["Property 'tags' has different type definitions in the creation transition and schema properties"]);
      } else {
        expect(check.ok).toBe(true);
      }
    }
  }
});

test('Using a status which is not defined should trigger an error', () => {
  /* Test for normal transition */
  const verify = new SchemaVerify(ajv, { name: 'test',
    description: 'test',
    statuses: { new: {} },
    creationTransition: { type: 'manual', toStatus: 'new' },
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
    creationTransition: { type: 'manual', toStatus: 'new' },
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
