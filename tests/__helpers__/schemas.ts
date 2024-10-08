import { Schema } from '@extrahorizon/javascript-sdk';

export const defaultSchemaReturnId = '65b2291d9bfa72b8fdc6a7b2';

export const minimalSchema = {
  name: 'my-minimal-schema',
  description: 'My minimal schema',
  statuses: {
    new: {},
  },
  creationTransition: {
    type: 'manual',
    toStatus: 'new',
  },
  transitions: [],
  properties: {},
};

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
            comments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  text: {
                    type: 'string',
                  },
                  staffIds: {
                    type: 'array',
                    items: {
                      type: 'string',
                      minLength: 1,
                    },
                  },
                },
              },
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
                minLength: 1,
                maxLength: 255,
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
  indexes: [],
  properties: {
    systolic: {
      type: 'number',
    },
    diastolic: {
      type: 'number',
    },
    timestamp: {
      type: 'string',
      format: 'date-time',
    },
    category: {
      type: 'string',
    },
    report: {
      type: 'string',
    },
    comments: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
          },
          staffIds: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
    },
  },
};

export const createEmptySchema = (name: string, description: string): Schema => ({
  name,
  description,
  id: '65b2291d9bfa72b8fdc6a7b2',
  createMode: 'default',
  readMode: 'default',
  updateMode: 'default',
  deleteMode: 'permissionRequired',
  groupSyncMode: 'disabled',
  statuses: {
    start: {},
  },
  creationTransition: {
    toStatus: 'start',
    type: 'manual',
  },
  transitions: [],
  properties: {},
  indexes: [],
  updateTimestamp: new Date(),
  creationTimestamp: new Date(),
});
