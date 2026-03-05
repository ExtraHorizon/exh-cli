import * as fs from 'fs/promises';
import { handler } from '../../../src/commands/settings/sync';
import { spyOnConsole } from '../../__helpers__/consoleSpy';
import { fileServiceRepositoryMock as mockFileRepository, type FileRepositoryMock } from '../../__helpers__/fileRepositoryMock';
import { templateV2RepositoryMock as mockTemplateRepository, type TemplateV2RepositoryMock } from '../../__helpers__/templateV2RepositoryMock';
import { userRepositoryMock as mockUserRepository, type UserRepositoryMock } from '../../__helpers__/userRepositoryMock';

describe('exh settings sync', () => {
  const { expectConsoleLogToContain } = spyOnConsole();

  let userServiceMock: UserRepositoryMock;
  let fileServiceMock: FileRepositoryMock;
  let templateServiceV2Mock: TemplateV2RepositoryMock;

  beforeAll(() => {
    userServiceMock = mockUserRepository();
    fileServiceMock = mockFileRepository();
    templateServiceV2Mock = mockTemplateRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Updates the password policy', async () => {
    jest.spyOn(fs, 'readFile')
      .mockResolvedValueOnce(JSON.stringify({
        users: {
          passwordPolicy: {
            minimumLength: 3,
            maximumLength: 18,
          },
        },
      }));

    await handler();

    expect(userServiceMock.updatePasswordPolicySpy).toHaveBeenCalledTimes(1);
    expect(userServiceMock.updatePasswordPolicySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        minimumLength: 3,
        maximumLength: 18,
      })
    );
  });

  it('Updates the file service settings', async () => {
    jest.spyOn(fs, 'readFile')
      .mockResolvedValueOnce(JSON.stringify({
        files: {
          disableForceDownloadForMimeTypes: ['application/pdf', 'image/jpeg'],
        },
      }));

    await handler();

    expect(fileServiceMock.updateFileServiceSettings).toHaveBeenCalledTimes(1);
    expect(fileServiceMock.updateFileServiceSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        disableForceDownloadForMimeTypes: ['application/pdf', 'image/jpeg'],
      })
    );
  });

  it('Ignores non-existing templates', async () => {
    const templateId = '69a837094548684b3d64c9aa';
    jest.spyOn(fs, 'readFile')
      .mockResolvedValueOnce(JSON.stringify({
        users: {
          emailTemplates: {
            activationEmailTemplateName: 'activationEmailTemplate',
            reactivationPinEmailTemplateName: 'reactivationPinEmailTemplate',
          },
        },
      }));

    templateServiceV2Mock.findByNameSpy.mockResolvedValueOnce(null);
    templateServiceV2Mock.findByNameSpy.mockResolvedValueOnce({
      id: templateId,
      creationTimestamp: new Date(),
      updateTimestamp: new Date(),
      name: 'hello',
      outputs: {},
    });

    await handler();

    expectConsoleLogToContain('⚠️  Template with name "activationEmailTemplate" not found. Skipping activationEmailTemplateId.');
    expect(userServiceMock.updateEmailTemplatesSpy).toHaveBeenCalledTimes(1);
    expect(userServiceMock.updateEmailTemplatesSpy).toHaveBeenCalledWith({
      reactivationPinEmailTemplateId: templateId,
    });
  });

  it('Updates the email templates', async () => {
    const templateId = '69a837094548684b3d64c9aa';
    jest.spyOn(fs, 'readFile')
      .mockResolvedValueOnce(JSON.stringify({
        users: {
          emailTemplates: {
            activationEmailTemplateName: 'activationEmailTemplateId',
          },
        },
      }));

    templateServiceV2Mock.findByNameSpy.mockResolvedValueOnce({
      id: templateId,
      creationTimestamp: new Date(),
      updateTimestamp: new Date(),
      name: 'hello',
      outputs: {},
    });

    await handler();

    expect(userServiceMock.updateEmailTemplatesSpy).toHaveBeenCalledTimes(1);
    expect(userServiceMock.updateEmailTemplatesSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        activationEmailTemplateId: templateId,
      })
    );
  });

  it('Updates the verification settings', async () => {
    jest.spyOn(fs, 'readFile')
      .mockResolvedValueOnce(JSON.stringify({
        users: {
          verification: {
            enablePinCodeActivationRequests: true,
          },
        },
      }));

    await handler();

    expect(userServiceMock.updateVerificationSettingsSpy).toHaveBeenCalledTimes(1);
    expect(userServiceMock.updateVerificationSettingsSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        enablePinCodeActivationRequests: true,
      })
    );
  });
});
