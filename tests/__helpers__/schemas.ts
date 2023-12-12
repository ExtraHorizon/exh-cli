export const schema = {
  name: 'chads-blood-pressure-measurement',
  description: 'Blood pressure measurement',
  statuses: {
    created: {},
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
            },
            diastolic: {
              type: 'number',
            },
            diagnosis: {
              type: 'object',
              properties: {
                severity: {
                  type: 'string',
                },
                timestamp: {
                  type: 'string',
                },
              },
            },
            notes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  urgency: {
                    type: 'string',
                  },
                  staff: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        staffId: {
                          type: 'string',
                        },
                      },
                    },
                  },
                  comment: {
                    type: 'string',
                  },
                  timestamp: {
                    type: 'string',
                    format: 'date-time',
                  },
                },
              },
            },
          },
        },
      },
    ],
    actions: [],
  },
  properties: {
    systolic: {
      type: 'number',
      description: 'Systolic pressure in mmHg',
      minimum: 50,
      maximum: 200,
    },
    diastolic: {
      type: 'number',
      description: 'Diastolic pressure in mmHg',
      minimum: 50,
      maximum: 200,
    },
    diagnosis: {
      type: 'object',
      description: 'The diagnosis of the patient',
      properties: {
        severity: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'The class of the diagnosis',
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          description: 'The time of the diagnosis',
        },
      },
    },
    notes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          urgency: {
            type: 'string',
            enum: ['low', 'medium', 'high'],
            description: 'Urgency of the measurement',
          },
          staff: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                staffId: {
                  type: 'string',
                  description: 'A noted existing condition',
                },
              },
            },
          },
          comment: {
            type: 'string',
            description: 'A comment about the measurement',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'The time of the note',
          },
        },
      },
    },
  },
};
