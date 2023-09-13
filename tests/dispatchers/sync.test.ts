import { handler } from '../../src/commands/dispatchers/sync';

describe('Dispatchers - Sync', () => {
  it('Throws for a Dispatcher without a name', async () => {
    const file = './tests/dispatchers/data/invalid-dispatcher-name.json';
    const error = await handler({ sdk: undefined, file })
      .catch(e => e);

    expect(error.message).toBe('Dispatcher name is a required field');
  });

  it('Throws for an Action without a name', async () => {
    const file = './tests/dispatchers/data/invalid-action-name.json';
    const error = await handler({ sdk: undefined, file })
      .catch(e => e);

    expect(error.message).toBe('Action name is a required field');
  });
});
