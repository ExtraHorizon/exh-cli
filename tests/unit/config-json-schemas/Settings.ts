import * as settingsConfigSchema from '../../../src/config-json-schemas/SettingsConfig.json';
import { ajvValidate } from '../../../src/helpers/util';

describe('SettingsConfig.json JSON Schema definition', () => {
  const fullSettings = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    users: {
      passwordPolicy: {
        minimumLength: 8,
        maximumLength: 32,
        numberRequired: true,
        symbolRequired: true,
        upperCaseRequired: true,
        lowerCaseRequired: true,
      },
      emailTemplates: {
        activationEmailTemplateName: 'activation-template',
        reactivationEmailTemplateName: 'reactivation-template',
        passwordResetEmailTemplateName: 'reset-template',
        oidcUnlinkEmailTemplateName: 'oidc-unlink-template',
        oidcUnlinkPinEmailTemplateName: 'oidc-unlink-pin-template',
        activationPinEmailTemplateName: 'activation-pin-template',
        reactivationPinEmailTemplateName: 'reactivation-pin-template',
        passwordResetPinEmailTemplateName: 'reset-pin-template',
      },
      verification: {
        enablePinCodeActivationRequests: true,
        enablePinCodeForgotPasswordRequests: false,
      },
    },
    files: {
      disableForceDownloadForMimeTypes: [
        'application/pdf',
        'image/png',
      ],
    },
  };

  it('Accepts a full settings object', () => {
    expect(() => ajvValidate(settingsConfigSchema, fullSettings)).not.toThrow();
  });

  it('Accepts an empty settings object', () => {
    expect(() => ajvValidate(settingsConfigSchema, {})).not.toThrow();
  });

  it('Accepts a settings object with only a users configuration', () => {
    const settings = {
      users: fullSettings.users,
    };
    expect(() => ajvValidate(settingsConfigSchema, settings)).not.toThrow();
  });

  it('Accepts a settings object with only a files configuration', () => {
    const settings = {
      files: fullSettings.files,
    };

    expect(() => ajvValidate(settingsConfigSchema, settings)).not.toThrow();
  });

  it('Throws for a settings object with invalid properties', () => {
    const settings = {
      invalidProperty: 'not allowed',
    };

    expect(() => ajvValidate(settingsConfigSchema, settings)).toThrow(/must NOT have additional properties/);
  });

  it('Throws for a settings object with invalid users configuration', () => {
    const settings = {
      users: {
        passwordPolicy: {
          minimumLength: 'not a number',
        },
      },
    };

    expect(() => ajvValidate(settingsConfigSchema, settings)).toThrow(/must be integer/);
  });

  it('Throws for a settings object with invalid files configuration', () => {
    const settings = {
      files: {
        disableForceDownloadForMimeTypes: 'not an array',
      },
    };

    expect(() => ajvValidate(settingsConfigSchema, settings)).toThrow(/must be array/);
  });

  it('Throw for for a settings object with an empty string in disableForceDownloadForMimeTypes', () => {
    const settings = {
      files: {
        disableForceDownloadForMimeTypes: [''],
      },
    };

    expect(() => ajvValidate(settingsConfigSchema, settings)).toThrow(/must NOT have fewer than 3 characters/);
  });

  it('Throw for for a settings object with a string that is too long in disableForceDownloadForMimeTypes', () => {
    const longString = 'a'.repeat(256);
    const settings = {
      files: {
        disableForceDownloadForMimeTypes: [longString],
      },
    };

    expect(() => ajvValidate(settingsConfigSchema, settings)).toThrow(/must NOT have more than 255 characters/);
  });
});
