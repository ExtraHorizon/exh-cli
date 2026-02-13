import * as fs from 'fs/promises';
import { handler } from '../../../src/commands/dispatchers/sync';
import * as dispatcherRepository from '../../../src/repositories/dispatchers';
import { cliManagedTag } from '../../../src/services/dispatchers';
import { generateMailAction, generateTaskAction } from '../../__helpers__/actions';
import { dispatcherRepositoryMock, type DispatcherRepositoryMock } from '../../__helpers__/dispatcherRepositoryMock';
import { generateDispatcher, generateMinimalDispatcher } from '../../__helpers__/dispatchers';

describe('exh dispatchers sync', () => {
  let repositoryMock: DispatcherRepositoryMock;

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
      .mockResolvedValueOnce(JSON.stringify([dispatcher]));

    await expect(handler({ file: '', clean: false }))
      .rejects.toThrow('"0" must have required property \'name\'');
  });

  it('Throws for an Action without a name', async () => {
    const dispatcher = generateDispatcher({
      actions: [generateTaskAction({ name: undefined })],
    });

    jest.spyOn(fs, 'readFile')
      .mockResolvedValueOnce(JSON.stringify([dispatcher]));

    await expect(handler({ file: '', clean: false }))
      .rejects.toThrow('"0.actions.0" must have required property \'name\'');
  });

  it('Creates a Dispatcher with all fields set', async () => {
    const dispatcher = generateDispatcher();

    jest.spyOn(fs, 'readFile')
      .mockResolvedValueOnce(JSON.stringify([dispatcher]));

    const createDispatcherSpy = jest.spyOn(dispatcherRepository, 'create')
      .mockResolvedValueOnce(dispatcher);

    await handler({ file: '', clean: false });

    expect(createDispatcherSpy).toHaveBeenCalledTimes(1);
    expect(createDispatcherSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: dispatcher.name,
        tags: [dispatcher?.tags?.[0], dispatcher?.tags?.[1], 'EXH_CLI_MANAGED'],
      })
    );
  });

  it('Creates a Dispatcher with minimal fields set', async () => {
    const minimalDispatcher = generateMinimalDispatcher();

    jest.spyOn(fs, 'readFile')
      .mockResolvedValueOnce(JSON.stringify([minimalDispatcher]));

    const createDispatcherSpy = jest.spyOn(dispatcherRepository, 'create')
      // @ts-expect-error The minimal dispatcher does not satisfy the Dispatcher type, but is not relevant for the test case
      .mockResolvedValueOnce(minimalDispatcher);

    await handler({ file: '', clean: false });

    expect(createDispatcherSpy).toHaveBeenCalledTimes(1);
    expect(createDispatcherSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: minimalDispatcher.name,
        tags: ['EXH_CLI_MANAGED'],
      })
    );
  });

  it('Updates an existing Dispatcher', async () => {
    const dispatcher = generateDispatcher({ tags: [cliManagedTag, 'Tag1', 'Tag2'] });

    jest.spyOn(fs, 'readFile')
      .mockResolvedValueOnce(JSON.stringify([dispatcher]));

    jest.spyOn(dispatcherRepository, 'findAll')
      .mockResolvedValueOnce([dispatcher, generateDispatcher()]);

    await handler({ file: '', clean: false });

    expect(repositoryMock.updateDispatcherSpy).toHaveBeenCalledTimes(1);
    expect(repositoryMock.updateDispatcherSpy).toHaveBeenCalledWith(
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
      .mockResolvedValueOnce(JSON.stringify([dispatcher]));

    jest.spyOn(dispatcherRepository, 'create')
      .mockResolvedValueOnce(dispatcher);

    await handler({ file: '', clean: false });

    expect(dispatcherRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: dispatcher.name,
        tags: expect.arrayContaining(['EXH_CLI_MANAGED']),
      })
    );
  });

  it('Updates the Actions of an existing Dispatcher', async () => {
    jest.spyOn(fs, 'readFile')
      .mockResolvedValueOnce(JSON.stringify([repositoryMock.existingDispatcher]));

    await handler({ file: '', clean: false });

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
      .mockResolvedValueOnce([dispatcherWithExcessAction]);

    jest.spyOn(fs, 'readFile')
      .mockResolvedValueOnce(JSON.stringify([localDispatcher]));

    await handler({ file: '', clean: false });
    expect(repositoryMock.removeActionSpy).toHaveBeenCalledTimes(1);
    expect(repositoryMock.removeActionSpy).toHaveBeenCalledWith(dispatcherWithExcessAction.id, excessAction.id);
  });

  it('Removes Dispatchers that has been created with the CLI but is no longer present in the local file', async () => {
    const dispatcherToDelete = generateDispatcher();

    jest.spyOn(fs, 'readFile')
      .mockResolvedValueOnce(JSON.stringify([repositoryMock.existingDispatcher]));

    jest.spyOn(dispatcherRepository, 'findAll')
      .mockResolvedValue([repositoryMock.existingDispatcher, dispatcherToDelete]);

    await handler({ file: '', clean: true });

    expect(repositoryMock.removeDispatcherSpy).toHaveBeenCalledTimes(1);
    expect(repositoryMock.removeDispatcherSpy).toHaveBeenCalledWith(dispatcherToDelete.id);
  });

  it('Removes Dispatchers only when the clean argument is provided', async () => {
    const dispatcherToDelete = generateDispatcher();

    jest.spyOn(fs, 'readFile')
      .mockResolvedValueOnce(JSON.stringify([repositoryMock.existingDispatcher]));

    jest.spyOn(dispatcherRepository, 'findAll')
      .mockResolvedValue([repositoryMock.existingDispatcher, dispatcherToDelete]);

    await handler({ file: '', clean: false });

    expect(repositoryMock.removeDispatcherSpy).toHaveBeenCalledTimes(0);
  });
});
