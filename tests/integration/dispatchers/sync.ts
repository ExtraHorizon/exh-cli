import { handler } from '../../../src/commands/dispatchers/sync';
import { cliManagedTag } from '../../../src/services/dispatchers/sync';
import { generateMailAction, generateTaskAction } from '../../__helpers__/actions';
import { dispatcherRepositoryMock as mockDispatcherRepository, type DispatcherRepositoryMock } from '../../__helpers__/dispatcherRepositoryMock';
import { generateDispatcher, generateMinimalDispatcher } from '../../__helpers__/dispatchers';
import { createTempDirectoryManager, type TempDirectoryManager } from '../../__helpers__/tempDirectoryManager';
import { generateTemplateV2 } from '../../__helpers__/templates';
import { templateV2RepositoryMock as mockTemplateRepository, type TemplateV2RepositoryMock } from '../../__helpers__/templateV2RepositoryMock';
import { generateId } from '../../__helpers__/utils';

describe('exh dispatchers sync', () => {
  let dispatcherRepositoryMock: DispatcherRepositoryMock;
  let templateV2RepositoryMock: TemplateV2RepositoryMock;
  let tempDirectoryManager: TempDirectoryManager;

  beforeAll(() => {
    dispatcherRepositoryMock = mockDispatcherRepository();
    templateV2RepositoryMock = mockTemplateRepository();
  });

  beforeEach(async () => {
    tempDirectoryManager = await createTempDirectoryManager();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await tempDirectoryManager.removeDirectory();
  });

  it('Throws for a Dispatcher without a name', async () => {
    const dispatcher = generateDispatcher({
      name: undefined,
    });

    const dispatcherFile = await tempDirectoryManager.createJsonFile('dispatchers', [dispatcher]);

    await expect(handler({ file: dispatcherFile, clean: false }))
      .rejects.toThrow('"0" must have required property \'name\'');
  });

  it('Throws for an Action without a name', async () => {
    const dispatcher = generateDispatcher({
      actions: [generateTaskAction({ name: undefined })],
    });

    const dispatcherFile = await tempDirectoryManager.createJsonFile('dispatchers', [dispatcher]);

    await expect(handler({ file: dispatcherFile, clean: false }))
      .rejects.toThrow('"0.actions.0" must have required property \'name\'');
  });

  it('Creates a Dispatcher with all fields set', async () => {
    const dispatcher = generateDispatcher();

    const dispatcherFile = await tempDirectoryManager.createJsonFile('dispatchers', [dispatcher]);

    await handler({ file: dispatcherFile, clean: false });

    expect(dispatcherRepositoryMock.createSpy).toHaveBeenCalledTimes(1);
    expect(dispatcherRepositoryMock.createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: dispatcher.name,
        tags: [dispatcher?.tags?.[0], dispatcher?.tags?.[1], 'EXH_CLI_MANAGED'],
      })
    );
  });

  it('Creates a Dispatcher with minimal fields set', async () => {
    const minimalDispatcher = generateMinimalDispatcher();

    const dispatcherFile = await tempDirectoryManager.createJsonFile('dispatchers', [minimalDispatcher]);

    await handler({ file: dispatcherFile, clean: false });

    expect(dispatcherRepositoryMock.createSpy).toHaveBeenCalledTimes(1);
    expect(dispatcherRepositoryMock.createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: minimalDispatcher.name,
        tags: ['EXH_CLI_MANAGED'],
      })
    );
  });

  it('Creates a dispatcher with a mail action with a templateName', async () => {
    const templateId = generateId();
    const dispatcher = generateMinimalDispatcher();
    dispatcher.actions = [generateMailAction({ templateName: 'TestTemplate' })];

    const dispatcherFile = await tempDirectoryManager.createJsonFile('dispatchers', [dispatcher]);

    templateV2RepositoryMock.findByNameSpy.mockResolvedValueOnce(generateTemplateV2({ id: templateId }));

    await handler({ file: dispatcherFile, clean: false });

    expect(templateV2RepositoryMock.findByNameSpy).toHaveBeenCalledWith('TestTemplate');
    expect(dispatcherRepositoryMock.createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        actions: [expect.objectContaining({ templateId })],
      })
    );
  });

  it('Uses templateName to override an existing templateId on mail action', async () => {
    const originalTemplateId = generateId();
    const resolvedTemplateId = generateId();
    const dispatcher = generateMinimalDispatcher();
    dispatcher.actions = [generateMailAction({ templateId: originalTemplateId, templateName: 'TestTemplate' })];

    const dispatcherFile = await tempDirectoryManager.createJsonFile('dispatchers', [dispatcher]);

    templateV2RepositoryMock.findByNameSpy.mockResolvedValueOnce(generateTemplateV2({ id: resolvedTemplateId }));

    await handler({ file: dispatcherFile, clean: false });

    expect(templateV2RepositoryMock.findByNameSpy).toHaveBeenCalledWith('TestTemplate');
    expect(dispatcherRepositoryMock.createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        actions: [expect.objectContaining({ templateId: resolvedTemplateId })],
      })
    );
  });

  it('Throws if templateName does not exist for mail action', async () => {
    const dispatcher = generateMinimalDispatcher();
    dispatcher.actions = [generateMailAction({ templateName: 'MissingTemplate' })];

    const dispatcherFile = await tempDirectoryManager.createJsonFile('dispatchers', [dispatcher]);

    templateV2RepositoryMock.findByNameSpy.mockResolvedValueOnce(undefined);

    await expect(handler({ file: dispatcherFile, clean: false }))
      .rejects.toThrow(`Template "MissingTemplate" not found for Action "${dispatcher.actions[0].name}"`);
  });

  it('Updates an existing Dispatcher', async () => {
    const dispatcher = generateDispatcher({ tags: [cliManagedTag, 'Tag1', 'Tag2'] });

    const dispatcherFile = await tempDirectoryManager.createJsonFile('dispatchers', [dispatcher]);

    dispatcherRepositoryMock.findAllSpy.mockResolvedValueOnce([dispatcher, generateDispatcher()]);

    await handler({ file: dispatcherFile, clean: false });

    expect(dispatcherRepositoryMock.updateDispatcherSpy).toHaveBeenCalledTimes(1);
    expect(dispatcherRepositoryMock.updateDispatcherSpy).toHaveBeenCalledWith(
      dispatcher.id,
      expect.objectContaining({
        name: dispatcher.name,
        tags: dispatcher.tags,
      })
    );
  });

  it('Updates a dispatcher with a mail action with a templateName', async () => {
    const templateId = generateId();
    const dispatcher = generateDispatcher({ tags: [cliManagedTag, 'Tag1', 'Tag2'] });
    dispatcher.actions = [generateMailAction({ templateName: 'TestTemplate' })];

    const dispatcherFile = await tempDirectoryManager.createJsonFile('dispatchers', [dispatcher]);

    dispatcherRepositoryMock.findAllSpy.mockResolvedValueOnce([dispatcher]);

    templateV2RepositoryMock.findByNameSpy.mockResolvedValueOnce(generateTemplateV2({ id: templateId }));

    await handler({ file: dispatcherFile, clean: false });

    expect(templateV2RepositoryMock.findByNameSpy).toHaveBeenCalledWith('TestTemplate');
    expect(dispatcherRepositoryMock.updateActionSpy).toHaveBeenCalledWith(
      dispatcher.id,
      dispatcher.actions[0].id,
      expect.objectContaining(
        { templateId }
      )
    );
  });

  it('Adds a EXH_CLI_MANAGED tag to Dispatchers', async () => {
    const dispatcher = generateDispatcher({ tags: [] });
    expect(dispatcher.tags).not.toContain('EXH_CLI_MANAGED');

    const dispatcherFile = await tempDirectoryManager.createJsonFile('dispatchers', [dispatcher]);

    await handler({ file: dispatcherFile, clean: false });

    expect(dispatcherRepositoryMock.createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: dispatcher.name,
        tags: expect.arrayContaining(['EXH_CLI_MANAGED']),
      })
    );
  });

  it('Updates the Actions of an existing Dispatcher', async () => {
    const dispatcherFile = await tempDirectoryManager.createJsonFile('dispatchers', [dispatcherRepositoryMock.existingDispatcher]);

    await handler({ file: dispatcherFile, clean: false });

    // The existing dispatcher has 2 actions, thus we expect the updateActionSpy to be called twice
    expect(dispatcherRepositoryMock.updateActionSpy).toHaveBeenCalledTimes(2);
  });

  it('Removes an Action from an existing Dispatcher', async () => {
    const existingActions = [generateTaskAction(), generateMailAction()];
    const excessAction = generateTaskAction();

    const localDispatcher = generateDispatcher({ actions: existingActions });
    const dispatcherWithExcessAction = {
      ...localDispatcher,
      actions: [...existingActions, excessAction],
    };

    dispatcherRepositoryMock.findAllSpy.mockResolvedValueOnce([dispatcherWithExcessAction]);

    const dispatcherFile = await tempDirectoryManager.createJsonFile('dispatchers', [localDispatcher]);

    await handler({ file: dispatcherFile, clean: false });
    expect(dispatcherRepositoryMock.removeActionSpy).toHaveBeenCalledTimes(1);
    expect(dispatcherRepositoryMock.removeActionSpy).toHaveBeenCalledWith(dispatcherWithExcessAction.id, excessAction.id);
  });

  it('Removes Dispatchers that has been created with the CLI but is no longer present in the local file', async () => {
    const dispatcherToDelete = generateDispatcher();

    const dispatcherFile = await tempDirectoryManager.createJsonFile('dispatchers', [dispatcherRepositoryMock.existingDispatcher]);

    dispatcherRepositoryMock.findAllSpy.mockResolvedValueOnce([dispatcherRepositoryMock.existingDispatcher, dispatcherToDelete]);

    await handler({ file: dispatcherFile, clean: true });

    expect(dispatcherRepositoryMock.removeDispatcherSpy).toHaveBeenCalledTimes(1);
    expect(dispatcherRepositoryMock.removeDispatcherSpy).toHaveBeenCalledWith(dispatcherToDelete.id);
  });

  it('Removes Dispatchers only when the clean argument is provided', async () => {
    const dispatcherToDelete = generateDispatcher();

    const dispatcherFile = await tempDirectoryManager.createJsonFile('dispatchers', [dispatcherRepositoryMock.existingDispatcher]);

    dispatcherRepositoryMock.findAllSpy.mockResolvedValueOnce([dispatcherRepositoryMock.existingDispatcher, dispatcherToDelete]);

    await handler({ file: dispatcherFile, clean: false });

    expect(dispatcherRepositoryMock.removeDispatcherSpy).toHaveBeenCalledTimes(0);
  });
});
