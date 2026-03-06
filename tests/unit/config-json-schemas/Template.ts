import * as templateConfigSchema from '../../../src/config-json-schemas/Template.json';
import { ajvValidate } from '../../../src/helpers/util';

describe('Template.json JSON Schema definition', () => {
  const minimalTemplateV2: any = {
    // Technically we don't require any properties for the v2 template?
  };

  const fullTemplateV2: any = {
    ...minimalTemplateV2,
    $schema: 'example.com/schema.json',
    extendsTemplate: 'baseTemplate',
    description: 'A full template config',
    inputs: {
      name: { type: 'string' },
      age: { type: 'number' },
      tags: {
        type: 'array',
        items: { type: 'string' },
      },
      address: {
        type: 'object',
        properties: {
          street: { type: 'string' },
          city: { type: 'string' },
        },
      },
    },
    outputs: {
      subject: 'Hello',
      body: 'World',
    },
  };
  
  describe('TemplateV2', () => {
    it('Accepts a minimal v2 template', () => {
      expect(() => ajvValidate(templateConfigSchema, minimalTemplateV2)).not.toThrow();
    });

    it('Accepts a full v2 template', () => {
      expect(() => ajvValidate(templateConfigSchema, fullTemplateV2)).not.toThrow();
    });

    it('Throws for anything else than strings in the outputs object', () => {
      const invalidOutputs = {
        ...minimalTemplateV2,
        outputs: {
          subject: 'Hello',
          body: 123,
        },
      };
      expect(() => ajvValidate(templateConfigSchema, invalidOutputs)).toThrow(/"outputs.body" must be string/);
    });

    it('Throws for an empty description or output string', () => {
      const emptyDescription = {
        ...minimalTemplateV2,
        description: '',
      };
      expect(() => ajvValidate(templateConfigSchema, emptyDescription)).toThrow(/"description" must NOT have fewer than 1 characters/);

      const emptyOutput = {
        ...minimalTemplateV2,
        outputs: { subject: '' },
      };
      expect(() => ajvValidate(templateConfigSchema, emptyOutput)).toThrow(/"outputs.subject" must NOT have fewer than 1 characters/);
    });

    it('Throws for additional properties on the template object', () => {
      const invalidTemplate = {
        ...minimalTemplateV2,
        extraProperty: 'not allowed',
      };
      expect(() => ajvValidate(templateConfigSchema, invalidTemplate)).toThrow(/must NOT have additional properties/);
    });

    it('Throws when specifying any extra properties on the type definitions', () => {
      const stringPropertyWithExtra = {
        ...minimalTemplateV2,
        inputs: {
          name: { type: 'string', extra: 'not allowed' },
        },
      };
      expect(() => ajvValidate(templateConfigSchema, stringPropertyWithExtra)).toThrow(/must NOT have additional properties/);

      const numberPropertyWithExtra = {
        ...minimalTemplateV2,
        inputs: {
          age: { type: 'number', extra: 'not allowed' },
        },
      };
      expect(() => ajvValidate(templateConfigSchema, numberPropertyWithExtra)).toThrow(/must NOT have additional properties/);

      const booleanPropertyWithExtra = {
        ...minimalTemplateV2,
        inputs: {
          isActive: { type: 'boolean', extra: 'not allowed' },
        },
      };
      expect(() => ajvValidate(templateConfigSchema, booleanPropertyWithExtra)).toThrow(/must NOT have additional properties/);

      const objectPropertyWithExtra = {
        ...minimalTemplateV2,
        inputs: {
          address: {
            type: 'object',
            properties: {
              street: { type: 'string' },
            },
            extra: 'not allowed',
          },
        },
      };
      expect(() => ajvValidate(templateConfigSchema, objectPropertyWithExtra)).toThrow(/must NOT have additional properties/);

      const arrayPropertyWithExtra = {
        ...minimalTemplateV2,
        inputs: {
          tags: {
            type: 'array',
            items: { type: 'string' },
            extra: 'not allowed',
          },
        },
      };
      expect(() => ajvValidate(templateConfigSchema, arrayPropertyWithExtra)).toThrow(/must NOT have additional properties/);
    });

    it('Throws for missing required properties on the type definitions', () => {
      const missingType = {
        ...minimalTemplateV2,
        inputs: {
          name: { },
        },
      };
      expect(() => ajvValidate(templateConfigSchema, missingType)).toThrow(/must have required property 'type'/);

      const missingItems = {
        ...minimalTemplateV2,
        inputs: {
          tags: { type: 'array' },
        },
      };
      expect(() => ajvValidate(templateConfigSchema, missingItems)).toThrow(/must have required property 'items'/);

      const missingProperties = {
        ...minimalTemplateV2,
        inputs: {
          address: { type: 'object' },
        },
      };
      expect(() => ajvValidate(templateConfigSchema, missingProperties)).toThrow(/must have required property 'properties'/);
    });
  });
});
