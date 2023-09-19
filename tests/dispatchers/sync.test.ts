import * as fs from 'fs/promises';
import { handler } from '../../src/commands/dispatchers/sync';
import * as dispatcherRepository from '../../src/repositories/dispatchers';
import { generateMailAction, generateTaskAction } from '../__helpers__/actions';
import { generateDispatcher, generateMinimalDispatcher } from '../__helpers__/dispatchers';

describe('Dispatchers - Sync', () => {
  let updateDispatcherSpy;
  let updateActionSpy;
  let deleteActionSpy;

  const existingDispatcher = generateDispatcher();

  beforeAll(() => {
    // TODO: Move these somewhere else?
    jest.spyOn(dispatcherRepository, 'findAll')
      .mockImplementation(() => Promise.resolve([existingDispatcher, generateDispatcher()]));

    updateDispatcherSpy = jest.spyOn(dispatcherRepository, 'update')
      .mockImplementation(() => Promise.resolve({ affectedRecords: 1 }));

    updateActionSpy = jest.spyOn(dispatcherRepository, 'updateAction')
      .mockImplementation(() => Promise.resolve({ affectedRecords: 1 }));

    deleteActionSpy = jest.spyOn(dispatcherRepository, 'deleteAction')
      .mockImplementationOnce(() => Promise.resolve({ affectedRecords: 1 }));
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

  it('Creates a Dispatcher with all fields set', async () => {
    const dispatcher = generateDispatcher();

    jest.spyOn(fs, 'readFile')
      .mockImplementationOnce(() => Promise.resolve(JSON.stringify([dispatcher])));

    const createDispatcherSpy = jest.spyOn(dispatcherRepository, 'create')
      .mockImplementationOnce(() => Promise.resolve(dispatcher));

    await handler({ sdk: undefined, file: '' });

    expect(createDispatcherSpy).toHaveBeenCalledTimes(1);
    expect(createDispatcherSpy).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        name: dispatcher.name,
        tags: [dispatcher.tags[0], dispatcher.tags[1], 'EXH_CLI_MANAGED'],
      })
    );
  });

  it('Creates a Dispatcher with minimal fields set', async () => {
    const minimalDispatcher = generateMinimalDispatcher();

    jest.spyOn(fs, 'readFile')
      .mockImplementationOnce(() => Promise.resolve(JSON.stringify([minimalDispatcher])));

    const createDispatcherSpy = jest.spyOn(dispatcherRepository, 'create')
      // @ts-expect-error The minimal dispatcher does not satisfy the Dispatcher type, but is not relevant for the test case
      .mockImplementationOnce(() => Promise.resolve(minimalDispatcher));

    await handler({ sdk: undefined, file: '' });

    expect(createDispatcherSpy).toHaveBeenCalledTimes(1);
    expect(createDispatcherSpy).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        name: minimalDispatcher.name,
        tags: ['EXH_CLI_MANAGED'],
      })
    );
  });

  it('Updates an existing Dispatcher', async () => {
    const dispatcher = generateDispatcher({ tags: ['EXH_CLI_MANAGED', 'Tag1', 'Tag2'] });

    jest.spyOn(fs, 'readFile')
      .mockImplementationOnce(() => Promise.resolve(JSON.stringify([dispatcher])));

    jest.spyOn(dispatcherRepository, 'findAll')
      .mockImplementationOnce(() => Promise.resolve([dispatcher, generateDispatcher()]));

    await handler({ sdk: undefined, file: '' });

    expect(updateDispatcherSpy).toHaveBeenCalledTimes(1);
    expect(updateDispatcherSpy).toHaveBeenCalledWith(
      undefined,
      dispatcher.id,
      expect.objectContaining({
        name: dispatcher.name,
        tags: dispatcher.tags,
      })
    );
  });

  it('Adds a EXH_CLI_MANAGED tag to Dispatchers', async () => {
    const dispatcher = generateDispatcher({ tags: [] });
    expect(dispatcher.tags).not.toContain('EXH_CLI_MANAGED');

    jest.spyOn(fs, 'readFile')
      .mockImplementationOnce(() => Promise.resolve(JSON.stringify([dispatcher])));

    jest.spyOn(dispatcherRepository, 'create')
      .mockImplementationOnce(() => Promise.resolve(dispatcher));

    await handler({ sdk: undefined, file: '' });

    expect(dispatcherRepository.create).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        name: dispatcher.name,
        tags: expect.arrayContaining(['EXH_CLI_MANAGED']),
      })
    );
  });

  it('Updates an Action of an existing Dispatcher', async () => {
    jest.spyOn(fs, 'readFile')
      .mockImplementationOnce(() => Promise.resolve(JSON.stringify([existingDispatcher])));

    await handler({ sdk: undefined, file: '' });
    expect(updateActionSpy).toHaveBeenCalledTimes(2);
  });

  it('Removes an Action from an existing Dispatcher', async () => {
    const existingActions = [generateTaskAction(), generateMailAction()];
    const excessAction = generateTaskAction();

    const localDispatcher = generateDispatcher({ actions: existingActions });
    const dispatcherWithExcessAction = {
      ...localDispatcher,
      actions: [...existingActions, excessAction],
    };

    jest.spyOn(dispatcherRepository, 'findAll')
      .mockImplementationOnce(() => Promise.resolve([dispatcherWithExcessAction]));

    jest.spyOn(fs, 'readFile')
      .mockImplementationOnce(() => Promise.resolve(JSON.stringify([localDispatcher])));

    await handler({ sdk: undefined, file: '' });
    expect(deleteActionSpy).toHaveBeenCalledTimes(1);
    expect(deleteActionSpy).toHaveBeenCalledWith(
      undefined,
      dispatcherWithExcessAction.id,
      excessAction.id
    );
  });
});
