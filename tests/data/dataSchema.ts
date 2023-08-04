export const properties = {
  firstproperty: {
    type: 'string',
  },
  secondproperty: {
    type: 'number',
  },
};

export const propertiesModified = {
  secondproperty: {
    type: 'string',
  },
  thirdproperty: {
    type: 'string',
  },
};

export const transitions = [
  {
    name: 'first-transition',
    id: 'abc',
    type: 'manual',
    fromStatuses: [
      'created',
    ],
    toStatus: 'active',
  },
  {
    name: 'second-transition',
    id: 'abcd',
    type: 'manual',
    fromStatuses: [
      'created',
    ],
    toStatus: 'active',
  },
];

export const transitionsModified = [
  {
    name: 'second-transition',
    type: 'automatic',
    fromStatuses: [
      'created',
    ],
    toStatus: 'active',
  },
  {
    name: 'third-transition',
    type: 'manual',
    fromStatuses: [
      'created',
    ],
    toStatus: 'active',
  },
];
