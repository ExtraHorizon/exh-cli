import * as dispatchersConfigSchema from '../../../src/config-json-schemas/Dispatchers.json';
import { ajvValidate } from '../../../src/helpers/util';

describe('Dispatchers.json JSON Schema definition', () => {
  const minimalMailAction: any = {
    type: 'mail',
    name: 'myMailAction',
    recipients: {
      to: ['example@example.com'],
    },
    templateId: 'template123',
  };

  const minimalTaskAction: any = {
    type: 'task',
    name: 'myTaskAction',
    functionName: 'myFunction',
  };

  const minimalDispatcher: any = {
    eventType: 'myEvent',
    name: 'myDispatcher',
    actions: [minimalMailAction, minimalTaskAction],
  };

  const fullMailAction: any = {
    ...minimalMailAction,
    description: 'A full mail action config',
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

  const fullDispatcher: any = {
    ...minimalDispatcher,
    description: 'A full dispatcher config',
    actions: [fullMailAction, fullTaskAction],
    tags: ['tag1', 'tag2'],
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

  it('Accepts additional properties on the dispatcher objects', () => {
    const dispatcher = {
      ...minimalDispatcher,
      extra: 'not allowed',
    };
    expect(() => ajvValidate(dispatchersConfigSchema, [dispatcher])).not.toThrow();
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

  it('Throws for a dispatcher missing an action', () => {
    const dispatcher = {
      ...minimalDispatcher,
      actions: [],
    };
    expect(() => ajvValidate(dispatchersConfigSchema, [dispatcher])).toThrow(/must NOT have fewer than 1 items /);
  });

  it('Throws for anything that is not an array or the wrapper object', () => {
    expect(() => ajvValidate(dispatchersConfigSchema, 'not an array')).toThrow(/must be array/);
    expect(() => ajvValidate(dispatchersConfigSchema, 42)).toThrow(/must be array/);
  });

  describe('Mail action', () => {
    it('Accepts additional properties on the mail action', () => {
      const dispatcher = {
        ...minimalDispatcher,
        actions: [{
          ...minimalMailAction,
          extra: 'not allowed',
        }],
      };
      expect(() => ajvValidate(dispatchersConfigSchema, [dispatcher])).not.toThrow();
    });

    it('Accepts additional properties on the recipients object', () => {
      const mailActionWithExtraRecipientField = {
        ...minimalMailAction,
        recipients: {
          ...minimalMailAction.recipients,
          extra: 'not allowed',
        },
      };
      const dispatcher = {
        ...minimalDispatcher,
        actions: [mailActionWithExtraRecipientField],
      };
      expect(() => ajvValidate(dispatchersConfigSchema, [dispatcher])).not.toThrow();
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
  });

  describe('Task action', () => {
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

    it('Accepts additional properties on the task action', () => {
      const dispatcher = {
        ...minimalDispatcher,
        actions: [{
          ...minimalTaskAction,
          extra: 'not allowed',
        }],
      };
      expect(() => ajvValidate(dispatchersConfigSchema, [dispatcher])).not.toThrow();
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
  });

  describe('wrapper object', () => {
    it('Accepts the $schema property', () => {
      const wrapper = {
        dispatchers: [],
        $schema: 'example.json',
      };
      expect(() => ajvValidate(dispatchersConfigSchema, wrapper)).not.toThrow();
    });

    it('Accepts extra properties on the wrapper object', () => {
      const wrapper = {
        dispatchers: [],
        extra: 'not allowed',
      };
      expect(() => ajvValidate(dispatchersConfigSchema, wrapper)).not.toThrow();
    });

    it('Throws for missing the dispatchers array on the wrapper object', () => {
      expect(() => ajvValidate(dispatchersConfigSchema, {})).toThrow(/must have required property 'dispatchers'/);
    });
  });
});
