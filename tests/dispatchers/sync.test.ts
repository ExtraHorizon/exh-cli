import * as fs from 'fs/promises';
import { handler } from '../../src/commands/dispatchers/sync';
import * as dispatcherRepository from '../../src/repositories/dispatchers';
import { generateTaskAction } from '../__helpers__/actions';
import { generateDispatcher } from '../__helpers__/dispatchers';

describe('Dispatchers - Sync', () => {
  let logSpy;
  const existingDispatcher = generateDispatcher();

  beforeEach(() => {
    // TODO: Move to global before each
    logSpy = jest.spyOn(global.console, 'log');
    jest.spyOn(dispatcherRepository, 'getByCliManagedTag')
      .mockImplementation(() => Promise.resolve([existingDispatcher, generateDispatcher()]));
  });

  afterEach(() => {
    jest.clearAllMocks();
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
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('🔄  Synchronizing...'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('✅  Synchronized'));
  });

  it('Updates an existing Dispatcher', async () => {
    jest.spyOn(fs, 'readFile')
      .mockImplementationOnce(() => Promise.resolve(JSON.stringify([existingDispatcher])));

    jest.spyOn(dispatcherRepository, 'update')
      .mockImplementationOnce(() => Promise.resolve({ affectedRecords: 1 }));

    jest.spyOn(dispatcherRepository, 'updateAction')
      .mockImplementation(() => Promise.resolve({ affectedRecords: 1 }));

    await handler({ sdk: undefined, file: '' });

    expect(dispatcherRepository.update).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('🔄  Validating...'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('✅  Validated'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('🔄  Synchronizing...'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('✅  Synchronized'));
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
