import * as fs from 'fs/promises';
import { handler } from '../../../src/commands/settings/sync';
import { fileServiceRepositoryMock } from '../../__helpers__/fileRepositoryMock';
import { templateV2RepositoryMock } from '../../__helpers__/templateV2RepositoryMock';
import { userRepositoryMock } from '../../__helpers__/userRepositoryMock';

describe('exh settings sync', () => {
  let userServiceMock: ReturnType<typeof userRepositoryMock>;
  let fileServiceMock: ReturnType<typeof fileServiceRepositoryMock>;
  let templateServiceV2Mock: ReturnType<typeof templateV2RepositoryMock>;

  beforeAll(() => {
    userServiceMock = userRepositoryMock('hello', []);
    fileServiceMock = fileServiceRepositoryMock();
    templateServiceV2Mock = templateV2RepositoryMock();
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

    await handler({ file: 'service-settings.json' });

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

    await handler({ file: 'service-settings.json' });

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

    await handler({ file: 'service-settings.json' });

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

    await handler({ file: 'service-settings.json' });

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

    await handler({ file: 'service-settings.json' });

    expect(userServiceMock.updateVerificationSettingsSpy).toHaveBeenCalledTimes(1);
    expect(userServiceMock.updateVerificationSettingsSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        enablePinCodeActivationRequests: true,
      })
    );
  });
});
