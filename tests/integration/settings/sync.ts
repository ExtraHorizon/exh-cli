import { handler } from '../../../src/commands/settings/sync';
import { spyOnConsole } from '../../__helpers__/consoleSpy';
import { fileServiceRepositoryMock as mockFileRepository, type FileRepositoryMock } from '../../__helpers__/fileRepositoryMock';
import { createTempDirectoryManager, type TempDirectoryManager } from '../../__helpers__/tempDirectoryManager';
import { generateTemplateV2 } from '../../__helpers__/templates';
import { templateV2RepositoryMock as mockTemplateRepository, type TemplateV2RepositoryMock } from '../../__helpers__/templateV2RepositoryMock';
import { userRepositoryMock as mockUserRepository, type UserRepositoryMock } from '../../__helpers__/userRepositoryMock';

describe('exh settings sync', () => {
  const { expectConsoleLogToContain } = spyOnConsole();

  let userServiceMock: UserRepositoryMock;
  let fileServiceMock: FileRepositoryMock;
  let templateServiceV2Mock: TemplateV2RepositoryMock;

  let tempDirectoryManager: TempDirectoryManager;

  beforeAll(() => {
    userServiceMock = mockUserRepository();
    fileServiceMock = mockFileRepository();
    templateServiceV2Mock = mockTemplateRepository();
  });

  beforeEach(async () => {
    tempDirectoryManager = await createTempDirectoryManager();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await tempDirectoryManager.removeDirectory();
  });

  it('Updates the password policy', async () => {
    const settingsFile = await tempDirectoryManager.createJsonFile('service-settings', {
      users: {
        passwordPolicy: {
          minimumLength: 3,
          maximumLength: 18,
        },
      },
    });

    await handler({ file: settingsFile });

    expect(userServiceMock.updatePasswordPolicySpy).toHaveBeenCalledTimes(1);
    expect(userServiceMock.updatePasswordPolicySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        minimumLength: 3,
        maximumLength: 18,
      })
    );
  });

  it('Updates the file service settings', async () => {
    const settingsFile = await tempDirectoryManager.createJsonFile('service-settings', {
      files: {
        disableForceDownloadForMimeTypes: ['application/pdf', 'image/jpeg'],
      },
    });

    await handler({ file: settingsFile });

    expect(fileServiceMock.updateFileServiceSettings).toHaveBeenCalledTimes(1);
    expect(fileServiceMock.updateFileServiceSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        disableForceDownloadForMimeTypes: ['application/pdf', 'image/jpeg'],
      })
    );
  });

  it('Ignores non-existing templates', async () => {
    const template = generateTemplateV2();
    const settingsFile = await tempDirectoryManager.createJsonFile('service-settings', {
      users: {
        emailTemplates: {
          activationEmailTemplateName: 'activationEmailTemplate',
          reactivationPinEmailTemplateName: 'reactivationPinEmailTemplate',
        },
      },
    });

    templateServiceV2Mock.findByNameSpy.mockResolvedValueOnce(null);
    templateServiceV2Mock.findByNameSpy.mockResolvedValueOnce(template);

    await handler({ file: settingsFile });

    expectConsoleLogToContain('⚠️  Template with name "activationEmailTemplate" not found. Skipping activationEmailTemplateId.');
    expect(userServiceMock.updateEmailTemplatesSpy).toHaveBeenCalledTimes(1);
    expect(userServiceMock.updateEmailTemplatesSpy).toHaveBeenCalledWith({
      reactivationPinEmailTemplateId: template.id,
    });
  });

  it('Updates the email templates', async () => {
    const template = generateTemplateV2();
    const settingsFile = await tempDirectoryManager.createJsonFile('service-settings', {
      users: {
        emailTemplates: {
          activationEmailTemplateName: 'activationEmailTemplateId',
        },
      },
    });

    templateServiceV2Mock.findByNameSpy.mockResolvedValueOnce(template);

    await handler({ file: settingsFile });

    expect(userServiceMock.updateEmailTemplatesSpy).toHaveBeenCalledTimes(1);
    expect(userServiceMock.updateEmailTemplatesSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        activationEmailTemplateId: template.id,
      })
    );
  });

  it('Updates the verification settings', async () => {
    const settingsFile = await tempDirectoryManager.createJsonFile('service-settings', {
      users: {
        verification: {
          enablePinCodeActivationRequests: true,
        },
      },
    });

    await handler({ file: settingsFile });

    expect(userServiceMock.updateVerificationSettingsSpy).toHaveBeenCalledTimes(1);
    expect(userServiceMock.updateVerificationSettingsSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        enablePinCodeActivationRequests: true,
      })
    );
  });
});
