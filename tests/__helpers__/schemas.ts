export const validSchema: any = {
  name: 'blood-pressure-measurement',
  description: 'Blood pressure measurement',
  statuses: {
    created: {},
    analyzing: {},
    analyzed: {},
    'report-available': {},
  },
  creationTransition: {
    type: 'manual',
    toStatus: 'created',
    conditions: [
      {
        type: 'input',
        configuration: {
          type: 'object',
          properties: {
            systolic: {
              type: 'number',
              const: 200,
            },
            diastolic: {
              type: 'number',
            },
          },
        },
      },
    ],
    actions: [
      {
        type: 'linkCreator',
      },
      {
        type: 'linkEnlistedGroups',
      },
    ],
  },
  transitions: [
    {
      name: 'start-analysis',
      type: 'automatic',
      toStatus: 'analyzing',
      fromStatuses: ['created'],
      actions: [
        {
          type: 'task',
          functionName: 'analyze-blood-pressure',
        },
      ],
    },
    {
      name: 'mark-as-analyzed',
      type: 'manual',
      toStatus: 'analyzed',
      fromStatuses: ['analyzing'],
      conditions: [
        {
          type: 'input',
          configuration: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                enum: ['normal', 'elevated', 'hypertension-stage-1', 'hypertension-stage-2', 'hypertensive-crisis'],
              },
            },
            required: ['category'],
          },
        },
      ],
    },
    {
      name: 'add-report',
      type: 'manual',
      toStatus: 'report-available',
      fromStatuses: ['analyzed'],
      conditions: [
        {
          type: 'input',
          configuration: {
            type: 'object',
            properties: {
              report: {
                type: 'string',
              },
            },
            required: ['report'],
          },
        },
      ],
    },
  ],
  properties: {
    systolic: {
      type: 'number',
      description: 'Systolic pressure in mmHg',
    },
    diastolic: {
      type: 'number',
      description: 'Diastolic pressure in mmHg',
    },
    timestamp: {
      type: 'string',
      format: 'date-time',
      description: 'Timestamp when the measurement was taken',
    },
    category: {
      type: 'string',
      description: 'Category of the result',
    },
    report: {
      type: 'string',
      description: 'File-token of the report',
    },
  },
};
