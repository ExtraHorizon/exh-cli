import * as Joi from 'joi';

// The service actually accepts almost any key, but we want to enforce a pattern
const keyPattern = /^[a-z0-9_.-]{1,200}$/i;

const localizationFileSchema = Joi.object()
  .pattern(keyPattern, Joi.string());

export function assertValidFileContent(fileName: string, content: unknown): content is Record<string, string> {
  const result = localizationFileSchema.validate(content);

  if (result.error != null) {
    throw new Error(`The content of localization file '${fileName}' is not valid: ${result.error.message}`);
  }

  return true;
}
