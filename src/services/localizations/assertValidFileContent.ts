import Ajv from 'ajv';
import { getAjvErrorStrings } from '../../helpers/util';

const validate = new Ajv().compile({
  type: 'object',
  patternProperties: {
    // The service actually accepts almost any key, but we want to enforce a pattern
    '^[a-z0-9_.-]{1,200}$': { type: 'string' },
  },
  additionalProperties: false,
});

export function assertValidFileContent(fileName: string, content: unknown): asserts content is Record<string, string> {
  const valid = validate(content);

  if (!valid) {
    const errors = getAjvErrorStrings(validate.errors);
    throw new Error(`The content of localization file '${fileName}' is not valid: ${errors[0]}`);
  }
}
