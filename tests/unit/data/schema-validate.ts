import Ajv from 'ajv';
import { SchemaVerify, TestId } from '../../../src/commands/data/schemas/util/schemaverify';
import * as metaschema from '../../../src/config-json-schemas/Schema.json';
import { minimalSchema } from '../../__helpers__/schemas';

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
  const schema = {
    ...minimalSchema,
    properties: { foo: 'bar' },
  };
  const verify = new SchemaVerify(ajv, schema, metaschema);
  for (const check of verify.RunChecks()) {
    if (check.id === TestId.META_SCHEMA) {
      expect(check.ok).toBe(false);
    } else {
      expect(check.ok).toBe(true);
    }
  }
});

test('Invalid JSON schema in creationTransition input condition must trigger an error', () => {
  const schema = {
    ...minimalSchema,
    creationTransition: {
      type: 'manual',
      toStatus: 'new',
      conditions: [
        {
          type: 'input',
          configuration: {
            type: 'test',
          },
        },
      ],
    },
  };
  const verify = ajv.compile(metaschema);
  expect(verify(schema)).toBe(false);
});

test('Valid JSON schema in creationTransition input condition must not trigger an error', () => {
  const verify = new SchemaVerify(ajv, {
    ...minimalSchema,
    creationTransition: {
      type: 'manual',
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
      ],
    },
    properties: {
      name: { type: 'string' },
    },
  }, metaschema);
  for (const check of verify.RunChecks()) {
    expect(check.ok).toBe(true);
  }
});

test('An item of an array with an id should error', () => {
  const verify = new SchemaVerify(ajv, {
    ...minimalSchema,
    properties: {
      name: {
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
    },
  }, metaschema);

  for (const check of verify.RunChecks()) {
    if (check.id === TestId.PROPERTY_VERIFY) {
      expect(check.ok).toBe(false);
      expect(check.errors).toStrictEqual(['The following id property is not allowed: properties.name.items.properties.id']);
    }
  }

  expect.assertions(2);
});

test('An item of a nested array with an id should error', () => {
  const verify = new SchemaVerify(ajv, {
    ...minimalSchema,
    properties: {
      name: {
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
      },
    },
  }, metaschema);

  for (const check of verify.RunChecks()) {
    if (check.id === TestId.PROPERTY_VERIFY) {
      expect(check.ok).toBe(false);
      expect(check.errors).toStrictEqual(['The following id property is not allowed: properties.name.items.items.items.properties.id']);
    }
  }

  expect.assertions(2);
});

test('An item of an array in a sub property with an id should error', () => {
  const verify = new SchemaVerify(ajv, {
    ...minimalSchema,
    properties: {
      name: {
        type: 'object',
        properties: {
          subname: {
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
        },
      },
    },
  }, metaschema);

  for (const check of verify.RunChecks()) {
    if (check.id === TestId.PROPERTY_VERIFY) {
      expect(check.ok).toBe(false);
      expect(check.errors).toStrictEqual(['The following id property is not allowed: properties.name.properties.subname.items.properties.id']);
    }
  }

  expect.assertions(2);
});

test('A deeply nested item in array property with an id should error', () => {
  const verify = new SchemaVerify(ajv, {
    ...minimalSchema,
    properties: {
      name: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            subname: {
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
          },
        },
      },
    },
  }, metaschema);

  for (const check of verify.RunChecks()) {
    if (check.id === TestId.PROPERTY_VERIFY) {
      expect(check.ok).toBe(false);
      expect(check.errors).toStrictEqual(['The following id property is not allowed: properties.name.items.properties.subname.items.properties.id']);
    }
  }

  expect.assertions(2);
});

test('An item of an array with an id should error for all properties', () => {
  const verify = new SchemaVerify(ajv, {
    ...minimalSchema,
    properties: {
      firstProperty: {
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

      },
    },
  }, metaschema);

  for (const check of verify.RunChecks()) {
    if (check.id === TestId.PROPERTY_VERIFY) {
      expect(check.ok).toBe(false);
      expect(check.errors).toStrictEqual([
        'The following id property is not allowed: properties.firstProperty.items.properties.id',
        'The following id property is not allowed: properties.thirdProperty.items.properties.id',
      ]);
    }
  }

  expect.assertions(2);
});

it('An item in array property with an id within an object w/ additionalProperties should error', async () => {
  const verify = new SchemaVerify(ajv, {
    ...minimalSchema,
    properties: {
      deeper: {
        type: 'object',
        additionalProperties: { // Special case required to traverse this
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' }, // Not allowed to be named `id`
            },
          },
        },
      },
    },
  }, metaschema);

  for (const check of verify.RunChecks()) {
    if (check.id === TestId.PROPERTY_VERIFY) {
      expect(check.ok).toBe(false);
      expect(check.errors).toStrictEqual(['The following id property is not allowed: properties.deeper.additionalProperties.items.properties.id']);
    }
  }

  expect.assertions(2);
});

it('An item in array property with an id within an object w/ additionalProperties within an array should error', async () => {
  const verify = new SchemaVerify(ajv, {
    ...minimalSchema,
    properties: {
      list: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: { // Special case required to traverse this
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' }, // Not allowed to be named `id`
              },
            },
          },
        },
      },
    },
  }, metaschema);

  for (const check of verify.RunChecks()) {
    if (check.id === TestId.PROPERTY_VERIFY) {
      expect(check.ok).toBe(false);
      expect(check.errors).toStrictEqual(['The following id property is not allowed: properties.list.items.additionalProperties.items.properties.id']);
    }
  }

  expect.assertions(2);
});

it('Supports having an object within an array with only its additionProperties set', async () => {
  const verify = new SchemaVerify(ajv, {
    ...minimalSchema,
    properties: {
      example: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: { type: 'string' },
          // No `properties` key to traverse for the "array of objects with id" check
        },
      },
    },
  }, metaschema);

  for (const check of verify.RunChecks()) {
    expect(check.ok).toBe(true);
  }
});

test('Valid JSON schema in transition condition must not trigger an error', () => {
  const verify = new SchemaVerify(ajv, {
    ...minimalSchema,
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
    properties: {
      name: { type: 'string' },
    },
  }, metaschema);
  for (const check of verify.RunChecks()) {
    expect(check.ok).toBe(true);
  }
});

test('Invalid JSON schema in transition input condition must trigger an error', () => {
  const schema = {
    ...minimalSchema,
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
  };

  const verify = new SchemaVerify(ajv, schema, metaschema);
  for (const check of verify.RunChecks()) {
    if (check.id === TestId.INPUT_CONDITIONS) {
      expect(check.ok).toBe(false);
    }
  }
});

test('Using a status which is not defined in a transition should trigger an error', () => {
  /* Test for normal transition */
  const verify = new SchemaVerify(ajv, {
    ...minimalSchema,
    statuses: { new: {}, dazed: {}, confused: {} },
    transitions: [
      {
        name: 'toDazed',
        type: 'automatic',
        fromStatuses: ['new'],
        toStatus: 'dazed',
        conditions: [],
      },
    ],
  }, metaschema);

  for (const check of verify.RunChecks()) {
    if (check.id === TestId.STATUS_CHECK) {
      expect(check.ok).toBe(false);
      expect(check.errors).toStrictEqual(["Status 'confused' is defined in the schema statuses but not used in any transition"]);
    }
  }
});

test('Using a status which is not defined should trigger an error', () => {
  /* Test for normal transition */
  const verify = new SchemaVerify(ajv, {
    ...minimalSchema,
    transitions: [
      {
        name: 'toProcessed',
        type: 'manual',
        fromStatuses: ['new'],
        toStatus: 'processed',
        conditions: [],
      },
    ],
    properties: {},
  }, metaschema);
  for (const check of verify.RunChecks()) {
    if (check.id === TestId.STATUS_CHECK) {
      expect(check.ok).toBe(false);
    } else {
      expect(check.ok).toBe(true);
    }
  }

  /* Test in creation transition */
  const verifySecond = new SchemaVerify(ajv, {
    ...minimalSchema,
    creationTransition: {
      type: 'manual',
      toStatus: 'processed',
      conditions: [],
    },
  }, metaschema);
  for (const check of verifySecond.RunChecks()) {
    if (check.id === TestId.STATUS_CHECK) {
      expect(check.ok).toBe(false);
    } else {
      expect(check.ok).toBe(true);
    }
  }
});

test('Using two or more transitions with the same name should throw an error', () => {
  /* Test for normal transition */
  const verify = new SchemaVerify(ajv, {
    ...minimalSchema,
    statuses: { new: {}, manual: {}, processed: {} },
    transitions: [
      {
        name: 'toProcessed',
        type: 'manual',
        fromStatuses: ['new'],
        toStatus: 'processed',
        conditions: [],
      },
      {
        name: 'toProcessed',
        type: 'manual',
        fromStatuses: ['manual'],
        toStatus: 'processed',
        conditions: [],
      },
      {
        name: 'toProcessed',
        type: 'manual',
        fromStatuses: ['processed'],
        toStatus: 'processed',
        conditions: [],
      },
      {
        name: 'revert',
        type: 'manual',
        fromStatuses: ['processed'],
        toStatus: 'new',
        conditions: [],
      },
    ],
  }, metaschema);

  for (const check of verify.RunChecks()) {
    if (check.id === TestId.TRANSITION_NAMES) {
      expect(check.ok).toBe(false);
      expect(check.errors).toStrictEqual(["Transition name 'toProcessed' is not unique"]);
    }
  }

  expect.assertions(2);
});

test('Using input conditions in non-manual transitions must give an error', () => {
  const verify = new SchemaVerify(ajv, {
    ...minimalSchema,
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
  }, metaschema);
  for (const check of verify.RunChecks()) {
    if (check.id === TestId.META_SCHEMA) {
      expect(check.ok).toBe(false);
    } else {
      expect(check.errors).toStrictEqual([]);
      expect(check.ok).toBe(true);
    }
  }
});

test('Using arrays for readMode, updateMode and deleteMode is allowed', () => {
  const verify = new SchemaVerify(ajv, {
    ...minimalSchema,
    readMode: ['linkedGroupStaff', 'linkedGroupPatients'],
    updateMode: ['linkedUsers'],
    deleteMode: ['creator'],
  }, metaschema);

  for (const check of verify.RunChecks()) {
    expect(check.ok).toBe(true);
  }
});

test('Using an array for the createMode is not allowed', () => {
  const verify = new SchemaVerify(ajv, {
    ...minimalSchema,
    createMode: ['creator'],
  }, metaschema);

  for (const check of verify.RunChecks()) {
    if (check.id === TestId.META_SCHEMA) {
      expect(check.ok).toBe(false);
    } else {
      expect(check.errors).toStrictEqual([]);
      expect(check.ok).toBe(true);
    }
  }
});
