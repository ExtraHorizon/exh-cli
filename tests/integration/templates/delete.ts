import { ServiceNotFoundError } from '@extrahorizon/javascript-sdk';
import { handler } from '../../../src/commands/templates/delete';
import { spyOnConsole } from '../../__helpers__/consoleSpy';
import { templateRepositoryMock, type TemplateRepositoryMock } from '../../__helpers__/templateRepositoryMock';
import { generateTemplate, generateTemplateV2 } from '../../__helpers__/templates';
import { templateV2RepositoryMock, type TemplateV2RepositoryMock } from '../../__helpers__/templateV2RepositoryMock';

describe('exh templates delete', () => {
  const { expectConsoleLogToContain } = spyOnConsole();
  const templateV1 = generateTemplate();
  const templateV2 = generateTemplateV2();
  let repositoryMock: TemplateRepositoryMock;
  let repositoryMockV2: TemplateV2RepositoryMock;

  beforeAll(() => {
    repositoryMock = templateRepositoryMock();
    repositoryMockV2 = templateV2RepositoryMock();
    repositoryMock.findByNameSpy.mockResolvedValue(templateV1);
    repositoryMock.findByIdSpy.mockResolvedValue(templateV1);
    repositoryMockV2.findByNameSpy.mockResolvedValue(templateV2);
    repositoryMockV2.findByIdSpy.mockResolvedValue(templateV2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Deletes a template by name from template service V2', async () => {
    await handler({ name: 'TemplateA' });

    expect(repositoryMockV2.findByNameSpy).toHaveBeenCalledWith('TemplateA');
    expect(repositoryMock.findByNameSpy).not.toHaveBeenCalled();
    expect(repositoryMockV2.removeSpy).toHaveBeenCalledWith(templateV2.id);
    expect(repositoryMock.removeSpy).not.toHaveBeenCalled();
    expectConsoleLogToContain('Template deleted');
  });

  it('Deletes a template by id from template service V2', async () => {
    await handler({ id: 'template-id' });

    expect(repositoryMockV2.findByIdSpy).toHaveBeenCalledWith('template-id');
    expect(repositoryMock.findByIdSpy).not.toHaveBeenCalled();
    expect(repositoryMockV2.removeSpy).toHaveBeenCalledWith(templateV2.id);
    expect(repositoryMock.removeSpy).not.toHaveBeenCalled();
    expectConsoleLogToContain('Template deleted');
  });

  it('Deletes a template from template service V1 if not found in V2', async () => {
    repositoryMockV2.findByNameSpy.mockResolvedValueOnce(undefined);
    repositoryMockV2.findByIdSpy.mockResolvedValueOnce(undefined);

    // By name
    await handler({ name: 'TemplateA' });

    expect(repositoryMockV2.findByNameSpy).toHaveBeenCalledWith('TemplateA');
    expect(repositoryMock.findByNameSpy).toHaveBeenCalledWith('TemplateA');
    expect(repositoryMock.removeSpy).toHaveBeenCalledWith(templateV1.id);
    expectConsoleLogToContain('Template deleted');

    // By id
    await handler({ id: 'template-id' });

    expect(repositoryMockV2.findByIdSpy).toHaveBeenCalledWith('template-id');
    expect(repositoryMock.findByIdSpy).toHaveBeenCalledWith('template-id');
    expect(repositoryMock.removeSpy).toHaveBeenCalledWith(templateV1.id);
    expectConsoleLogToContain('Template deleted');
  });

  it('Prints an error message if the template is not found in both V1 and V2', async () => {
    repositoryMockV2.findByNameSpy.mockResolvedValueOnce(undefined);
    repositoryMockV2.findByIdSpy.mockResolvedValueOnce(undefined);
    repositoryMock.findByNameSpy.mockResolvedValueOnce(undefined);
    repositoryMock.findByIdSpy.mockResolvedValueOnce(undefined);

    // By name
    await handler({ name: 'TemplateA' });
    expectConsoleLogToContain('Template not found!');

    // By id
    await handler({ id: 'template-id' });
    expectConsoleLogToContain('Template not found!');
  });

  it('Ignores the ServiceNotFoundError for template service V2', async () => {
    const serviceNotFoundError = new ServiceNotFoundError({ name: '', message: '' });
    repositoryMockV2.findByNameSpy.mockRejectedValueOnce(serviceNotFoundError);
    repositoryMockV2.findByIdSpy.mockRejectedValueOnce(serviceNotFoundError);

    await handler({ name: 'TemplateA' });

    // Gracefully falls back to V1 without throwing an error
    expect(repositoryMockV2.findByNameSpy).toHaveBeenCalledWith('TemplateA');
    expect(repositoryMock.findByNameSpy).toHaveBeenCalledWith('TemplateA');
    expect(repositoryMock.removeSpy).toHaveBeenCalledWith(templateV1.id);
    expectConsoleLogToContain('Template deleted');

    // By id
    await handler({ id: 'template-id' });

    expect(repositoryMockV2.findByIdSpy).toHaveBeenCalledWith('template-id');
    expect(repositoryMock.findByIdSpy).toHaveBeenCalledWith('template-id');
    expect(repositoryMock.removeSpy).toHaveBeenCalledWith(templateV1.id);
    expectConsoleLogToContain('Template deleted');
  });

  it('Ignores the ServiceNotFoundError for template service V1', async () => {
    const serviceNotFoundError = new ServiceNotFoundError({ name: '', message: '' });
    repositoryMockV2.findByNameSpy.mockResolvedValueOnce(undefined);
    repositoryMockV2.findByIdSpy.mockResolvedValueOnce(undefined);
    repositoryMock.findByNameSpy.mockRejectedValueOnce(serviceNotFoundError);
    repositoryMock.findByIdSpy.mockRejectedValueOnce(serviceNotFoundError);

    await handler({ name: 'TemplateA' });

    // Prints the same error message as if the template was not found, without throwing an error
    expect(repositoryMockV2.findByNameSpy).toHaveBeenCalledWith('TemplateA');
    expect(repositoryMock.findByNameSpy).toHaveBeenCalledWith('TemplateA');
    expectConsoleLogToContain('Template not found!');

    await handler({ id: 'template-id' });

    // Prints the same error message as if the template was not found, without throwing an error
    expect(repositoryMockV2.findByIdSpy).toHaveBeenCalledWith('template-id');
    expect(repositoryMock.findByIdSpy).toHaveBeenCalledWith('template-id');
    expectConsoleLogToContain('Template not found!');
  });
});
