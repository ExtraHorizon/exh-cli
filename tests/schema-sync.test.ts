import { compareSchemaKey } from '../src/commands/data/schemas/util/syncSchema';
import { properties, propertiesModified, transitions, transitionsModified } from './data/dataSchema';

describe('Sync schemas', () => {
  describe('compareSchemaKey', () => {
    test('Given two objects which do not have the given key, the function shall indicate nothing should me modified', () => {
      const response = compareSchemaKey({}, {}, 'key');
      expect(response).toStrictEqual({
        toAdd: [],
        toRemove: [],
        toUpdate: [],
      });
    });

    test('Given two schemas where the given key results in an object, the function shall return the values to add, remove or update as an array of object keys (strings)', () => {
      const cloudSchema = { properties };

      const localSchema = { properties: propertiesModified };
      const response = compareSchemaKey(localSchema, cloudSchema, 'properties');
      expect(response).toStrictEqual({
        toAdd: ['thirdproperty'],
        toRemove: ['firstproperty'],
        toUpdate: ['secondproperty'],
      });
    });

    test('Given two schemas where the given key results in an object, the function shall return the values to add, remove or update as an array of objects', () => {
      const localSchema = { transitions: transitionsModified };
      const cloudSchema = { transitions };

      const response = compareSchemaKey(localSchema, cloudSchema, 'transitions');
      // TODO: Improve test data utilization (don't use array indexes such as transitionsModified[1])
      expect(response).toStrictEqual({
        toAdd: [transitionsModified[1]],
        toRemove: [transitions[0]],
        toUpdate: [transitionsModified[0]],
      });
    });
  });
});
