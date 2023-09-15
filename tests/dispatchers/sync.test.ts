import * as fs from 'fs/promises';
import { handler } from '../../src/commands/dispatchers/sync';
import * as dispatcherRepository from '../../src/repositories/dispatchers';
import { generateTaskAction } from '../__helpers__/actions';
import { generateDispatcher } from '../__helpers__/dispatchers';

describe('Dispatchers - Sync', () => {
  // TODO: Move to before all
  const logSpy = jest.spyOn(global.console, 'log');
  const existingDispatcher = generateDispatcher();

  beforeAll(() => {
    jest.spyOn(dispatcherRepository, 'getByCliManagedTag')
      .mockImplementation(() => Promise.resolve([existingDispatcher, generateDispatcher()]));
  });

  it('Throws for a Dispatcher without a name', async () => {
    const dispatcher = generateDispatcher({
      name: undefined,
    });

    jest.spyOn(fs, 'readFile')
      .mockImplementationOnce(() => Promise.resolve(JSON.stringify([dispatcher])));

    const error = await handler({ sdk: undefined, file: '' })
      .catch(e => e);

    expect(error.message).toBe('Dispatcher name is a required field');
  });

  it('Throws for an Action without a name', async () => {
    const dispatcher = generateDispatcher({
      actions: [generateTaskAction({ name: undefined })],
    });

    jest.spyOn(fs, 'readFile')
      .mockImplementationOnce(() => Promise.resolve(JSON.stringify([dispatcher])));

    const error = await handler({ sdk: undefined, file: '' })
      .catch(e => e);

    expect(error.message).toBe('Action name is a required field');
  });

  it('Creates a new Dispatcher', async () => {
    const dispatcher = generateDispatcher();

    jest.spyOn(fs, 'readFile')
      .mockImplementationOnce(() => Promise.resolve(JSON.stringify([dispatcher])));

    jest.spyOn(dispatcherRepository, 'create')
      .mockImplementationOnce(() => Promise.resolve(dispatcher));

    const file = './tests/dispatchers/data/create-dispatcher.json';
    await handler({ sdk: undefined, file });

    expect(dispatcherRepository.create).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('🔄  Validating...'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('✅  Validated'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('🔄  Creating...'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('✅  Created'));
  });

  it('Updates an existing Dispatcher', async () => {
    jest.spyOn(fs, 'readFile')
      .mockImplementationOnce(() => Promise.resolve(JSON.stringify([existingDispatcher])));

    jest.spyOn(dispatcherRepository, 'update')
      .mockImplementationOnce(() => Promise.resolve({ affectedRecords: 1 }));

    await handler({ sdk: undefined, file: '' });

    expect(dispatcherRepository.update).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('🔄  Validating...'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('✅  Validated'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('🔄  Updating...'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('✅  Updated'));
  });

  it('Adds a EXH_CLI_MANAGED tag to Dispatchers', async () => {
    const dispatcher = generateDispatcher({ tags: [] });

    jest.spyOn(fs, 'readFile')
      .mockImplementationOnce(() => Promise.resolve(JSON.stringify([dispatcher])));

    jest.spyOn(dispatcherRepository, 'create')
      .mockImplementationOnce(() => Promise.resolve(dispatcher));

    await handler({ sdk: undefined, file: '' });

    expect(dispatcher.tags).not.toContain('EXH_CLI_MANAGED');
    expect(dispatcherRepository.create).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        tags: expect.arrayContaining(['EXH_CLI_MANAGED']),
      })
    );
  });
});
