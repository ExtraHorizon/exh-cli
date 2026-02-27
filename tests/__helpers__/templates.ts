import type { Template, TemplateV2 } from '@extrahorizon/javascript-sdk';
import { generateId } from './utils';

export function generateTemplate(overrides: Partial<Template> = {}): Template {
  return {
    id: generateId(),
    name: `template-${generateId()}`,
    description: `template-description-${generateId()}`,
    schema: {
      type: 'object',
    },
    fields: {
      subject: 'My Subject',
      body: 'My Body',
    },
    updateTimestamp: new Date(),
    creationTimestamp: new Date(),
    ...overrides,
  };
}

export function generateTemplateV2(overrides: Partial<TemplateV2> = {}): TemplateV2 {
  return {
    id: generateId(),
    name: `template-${generateId()}`,
    description: `template-description-${generateId()}`,
    inputs: {
      subject: { type: 'string' },
      body: { type: 'string' },
    },
    outputs: {
      subject: 'My Subject',
      body: 'My Body',
    },
    updateTimestamp: new Date(),
    creationTimestamp: new Date(),
    ...overrides,
  };
}
