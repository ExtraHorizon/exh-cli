import * as fs from 'fs/promises';
import { handler } from '../../src/commands/dispatchers/sync';
import * as dispatcherRepository from '../../src/repositories/dispatchers';
import { cliManagedTag } from '../../src/services/dispatchers';
import { generateMailAction, generateTaskAction } from '../__helpers__/actions';
import { dispatcherRepositoryMock } from '../__helpers__/dispatcherRepositoryMock';
import { generateDispatcher, generateMinimalDispatcher } from '../__helpers__/dispatchers';

describe('Dispatchers - Sync', () => {
  let repositoryMock;
  beforeAll(() => {
    repositoryMock = dispatcherRepositoryMock();
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

    await expect(handler({ sdk: undefined, file: '' }))
      .rejects.toThrow('Dispatcher name is a required field');
  });

  it('Throws for an Action without a name', async () => {
    const dispatcher = generateDispatcher({
      actions: [generateTaskAction({ name: undefined })],
    });

    jest.spyOn(fs, 'readFile')
      .mockImplementationOnce(() => Promise.resolve(JSON.stringify([dispatcher])));

    await expect(handler({ sdk: undefined, file: '' }))
      .rejects.toThrow('Action name is a required field');
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
    const dispatcher = generateDispatcher({ tags: [cliManagedTag, 'Tag1', 'Tag2'] });

    jest.spyOn(fs, 'readFile')
      .mockImplementationOnce(() => Promise.resolve(JSON.stringify([dispatcher])));

    jest.spyOn(dispatcherRepository, 'findAll')
      .mockImplementationOnce(() => Promise.resolve([dispatcher, generateDispatcher()]));

    await handler({ sdk: undefined, file: '' });

    expect(repositoryMock.updateDispatcherSpy).toHaveBeenCalledTimes(1);
    expect(repositoryMock.updateDispatcherSpy).toHaveBeenCalledWith(
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

  it('Updates the Actions of an existing Dispatcher', async () => {
    jest.spyOn(fs, 'readFile')
      .mockImplementationOnce(() => Promise.resolve(JSON.stringify([repositoryMock.existingDispatcher])));

    await handler({ sdk: undefined, file: '' });

    // The existing dispatcher has 2 actions, thus we expect the updateActionSpy to be called twice
    expect(repositoryMock.updateActionSpy).toHaveBeenCalledTimes(2);
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
    expect(repositoryMock.deleteActionSpy).toHaveBeenCalledTimes(1);
    expect(repositoryMock.deleteActionSpy).toHaveBeenCalledWith(
      undefined,
      dispatcherWithExcessAction.id,
      excessAction.id
    );
  });
});
