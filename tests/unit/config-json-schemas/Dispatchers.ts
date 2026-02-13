import * as dispatchersConfigSchema from '../../../src/config-json-schemas/Dispatchers.json';
import { ajvValidate } from '../../../src/helpers/util';

describe('Dispatchers.json JSON Schema definition', () => {
  const minimalDispatcher: any = {
    eventType: 'myEvent',
    name: 'myDispatcher',
    actions: [],
  };

  const fullDispatcher: any = {
    ...minimalDispatcher,
    description: 'A full dispatcher config',
    tags: ['tag1', 'tag2'],
  };

  const minimalMailAction: any = {
    type: 'mail',
    name: 'myMailAction',
    recipients: {
      to: ['example@example.com'],
    },
    templateId: 'template123',
  };

  const fullMailAction: any = {
    ...minimalMailAction,
    description: 'A full mail action config',
  };

  const minimalTaskAction: any = {
    type: 'task',
    name: 'myTaskAction',
    functionName: 'myFunction',
  };

  const fullTaskAction: any = {
    ...minimalTaskAction,
    description: 'A full task action config',
    data: {
      key: 'value',
    },
    tags: ['tag1', 'tag2'],
    startTimestamp: new Date().toISOString(),
  };

  it('Accepts an array or a wrapper object with an array', () => {
    expect(() => ajvValidate(dispatchersConfigSchema, { dispatchers: [] })).not.toThrow();
    expect(() => ajvValidate(dispatchersConfigSchema, [])).not.toThrow();
  });

  it('Accepts a minimal dispatcher', () => {
    expect(() => ajvValidate(dispatchersConfigSchema, [minimalDispatcher])).not.toThrow();
  });

  it('Accepts a full dispatcher', () => {
    expect(() => ajvValidate(dispatchersConfigSchema, [fullDispatcher])).not.toThrow();
  });

  it('Throws for missing required properties on the dispatcher object', () => {
    const dispatcherNoEventType = { ...minimalDispatcher };
    delete dispatcherNoEventType.eventType;
    expect(() => ajvValidate(dispatchersConfigSchema, [dispatcherNoEventType])).toThrow(/must have required property 'eventType'/);

    const dispatcherNoName = { ...minimalDispatcher };
    delete dispatcherNoName.name;
    expect(() => ajvValidate(dispatchersConfigSchema, [dispatcherNoName])).toThrow(/must have required property 'name'/);

    const dispatcherNoActions = { ...minimalDispatcher };
    delete dispatcherNoActions.actions;
    expect(() => ajvValidate(dispatchersConfigSchema, [dispatcherNoActions])).toThrow(/must have required property 'actions'/);
  });

  it('Throws for additional properties on the dispatcher object', () => {
    const dispatcher = {
      ...minimalDispatcher,
      extra: 'not allowed',
    };
    expect(() => ajvValidate(dispatchersConfigSchema, [dispatcher])).toThrow(/must NOT have additional properties/);
  });

  describe('Mail action', () => {
    it('Accepts a dispatcher with a minimal mail action', () => {
      const dispatcherWithMailAction = {
        ...minimalDispatcher,
        actions: [minimalMailAction],
      };
      expect(() => ajvValidate(dispatchersConfigSchema, [dispatcherWithMailAction])).not.toThrow();
    });

    it('Accepts a dispatcher with a full mail action', () => {
      const dispatcherWithMailAction = {
        ...minimalDispatcher,
        actions: [fullMailAction],
      };
      expect(() => ajvValidate(dispatchersConfigSchema, [dispatcherWithMailAction])).not.toThrow();
    });

    it('Throws for missing required properties on the mail action', () => {
      const mailActionNoName = { ...minimalMailAction };
      delete mailActionNoName.name;
      const dispatcher1 = {
        ...minimalDispatcher,
        actions: [mailActionNoName],
      };
      expect(() => ajvValidate(dispatchersConfigSchema, [dispatcher1])).toThrow(/must have required property 'name'/);

      const mailActionNoRecipients = { ...minimalMailAction };
      delete mailActionNoRecipients.recipients;
      const dispatcher = {
        ...minimalDispatcher,
        actions: [mailActionNoRecipients],
      };
      expect(() => ajvValidate(dispatchersConfigSchema, [dispatcher])).toThrow(/must have required property 'recipients'/);

      const mailActionNoTemplateId = { ...minimalMailAction };
      delete mailActionNoTemplateId.templateId;
      const dispatcher2 = {
        ...minimalDispatcher,
        actions: [mailActionNoTemplateId],
      };
      expect(() => ajvValidate(dispatchersConfigSchema, [dispatcher2])).toThrow(/must have required property 'templateId'/);
    });

    it('Throws for additional properties on the mail action', () => {
      const dispatcher = {
        ...minimalDispatcher,
        actions: [{
          ...minimalMailAction,
          extra: 'not allowed',
        }],
      };
      expect(() => ajvValidate(dispatchersConfigSchema, [dispatcher])).toThrow(/must NOT have additional properties/);
    });
  });

  describe('Task action', () => {
    it('Accepts a dispatcher with a minimal task action', () => {
      const dispatcherWithTaskAction = {
        ...minimalDispatcher,
        actions: [minimalTaskAction],
      };
      expect(() => ajvValidate(dispatchersConfigSchema, [dispatcherWithTaskAction])).not.toThrow();
    });

    it('Accepts a dispatcher with a full task action', () => {
      const dispatcherWithTaskAction = {
        ...minimalDispatcher,
        actions: [fullTaskAction],
      };
      expect(() => ajvValidate(dispatchersConfigSchema, [dispatcherWithTaskAction])).not.toThrow();
    });

    it('Accepts any kind of data fields in the task action', () => {
      const dispatcherWithTaskAction = {
        ...minimalDispatcher,
        actions: [{
          ...minimalTaskAction,
          data: {
            string: 'string value',
            number: 42,
            boolean: true,
            array: [1, 2, 3],
            object: { key: 'value' },
          },
        }],
      };
      expect(() => ajvValidate(dispatchersConfigSchema, [dispatcherWithTaskAction])).not.toThrow();
    });

    it('Throws for missing required properties on the task action', () => {
      const taskActionNoName = { ...minimalTaskAction };
      delete taskActionNoName.name;
      const dispatcher1 = {
        ...minimalDispatcher,
        actions: [taskActionNoName],
      };
      expect(() => ajvValidate(dispatchersConfigSchema, [dispatcher1])).toThrow(/must have required property 'name'/);

      const taskActionNoFunctionName = { ...minimalTaskAction };
      delete taskActionNoFunctionName.functionName;
      const dispatcher = {
        ...minimalDispatcher,
        actions: [taskActionNoFunctionName],
      };
      expect(() => ajvValidate(dispatchersConfigSchema, [dispatcher])).toThrow(/must have required property 'functionName'/);
    });

    it('Throws for additional properties on the task action', () => {
      const dispatcher = {
        ...minimalDispatcher,
        actions: [{
          ...minimalTaskAction,
          extra: 'not allowed',
        }],
      };
      expect(() => ajvValidate(dispatchersConfigSchema, [dispatcher])).toThrow(/must NOT have additional properties/);
    });
  });

  describe('wrapper object', () => {
    it('Accepts the $schema property', () => {
      const wrapper = {
        dispatchers: [],
        $schema: 'example.json',
      };
      expect(() => ajvValidate(dispatchersConfigSchema, wrapper)).not.toThrow();
    });

    it('Throws for extra properties on the wrapper object', () => {
      const wrapper = {
        dispatchers: [],
        extra: 'not allowed',
      };
      expect(() => ajvValidate(dispatchersConfigSchema, wrapper)).toThrow(/must NOT have additional properties/);
    });

    it('Throws for missing the dispatchers array on the wrapper object', () => {
      expect(() => ajvValidate(dispatchersConfigSchema, {})).toThrow(/must have required property 'dispatchers'/);
    });
  });
});
