import * as path from 'path';
import { compareStatuses, calculateStatusUpdateData } from '../../../src/commands/data/schemas/sync/statusHelpers';
import { readJsonFile } from '../../../src/commands/data/schemas/util/readJson';

describe('Sync - Statuses', () => {
  let cloudSchema;
  let localSchema;

  beforeAll(async () => {
    const root = './tests/data/sync/schemas';

    const cloudSchemaPath = path.resolve(`${root}/cloud.json`);
    cloudSchema = await readJsonFile(cloudSchemaPath);

    const localSchemaPath = path.resolve(`${root}/local.json`);
    localSchema = await readJsonFile(localSchemaPath);
  });

  it('Returns statuses to be created, updated and deleted', () => {
    const changes = compareStatuses(localSchema, cloudSchema);
    expect(changes).toStrictEqual({
      toAdd: ['Four'],
      toUpdate: ['Two'],
      toRemove: ['Six'],
    });
  });

  it('Returns a status properties to be added, updated and deleted', () => {
    const result = calculateStatusUpdateData(localSchema.statuses.Two, cloudSchema.statuses.Two);
    expect(result).toStrictEqual({
      kappa: 'Kappa',
      delta: 'Delta',
      omicron: 'Omicron',
      upsilon: 'Upsilon',
      nu: null,
      iota: null,
    });
  });
});
