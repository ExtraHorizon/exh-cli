import { Condition, Schema, Transition, TransitionAction } from '@extrahorizon/javascript-sdk';
import * as _ from 'lodash';

export function stripUnsupportedDescriptionFields(schema: Schema) {
  const newSchema = { ...schema };
  if (schema.creationTransition) {
    newSchema.creationTransition = _.omit(schema.creationTransition, 'description');
  }

  if (schema.transitions) {
    newSchema.transitions = schema.transitions.map(stripDescriptionsFromTransition);
  }

  if (schema.properties) {
    newSchema.properties = _.mapValues(schema.properties, stripDescriptionsFromTypeConfiguration);
  }

  if (schema.indexes) {
    newSchema.indexes = schema.indexes.map(index => _.omit(index, 'description'));
  }

  return newSchema;
}

function stripDescriptionsFromTransition(transition: Transition) {
  const newTransition = _.omit(transition, 'description');

  if (newTransition.conditions) {
    newTransition.conditions = newTransition.conditions.map(condition => {
      const newCondition: Condition = _.omit(condition, 'description');

      if (newCondition.type === 'input' || newCondition.type === 'document') {
        if (newCondition.configuration) {
          newCondition.configuration = stripDescriptionsFromTypeConfiguration(newCondition.configuration);
        }
      }

      return newCondition;
    });
  }

  if (newTransition.actions) {
    newTransition.actions = newTransition.actions.map(action => _.omit(action, 'description') as TransitionAction);
  }

  return newTransition;
}

function stripDescriptionsFromTypeConfiguration(configuration: any) {
  const newConfiguration = _.omit(configuration, 'description');

  if (newConfiguration.type === 'object') {
    if (newConfiguration.properties) {
      newConfiguration.properties = _.mapValues(newConfiguration.properties, stripDescriptionsFromTypeConfiguration);
    }

    if (newConfiguration.additionalProperties) {
      newConfiguration.additionalProperties = stripDescriptionsFromTypeConfiguration(newConfiguration.additionalProperties);
    }
  }

  if (newConfiguration.type === 'array') {
    if (newConfiguration.items) {
      newConfiguration.items = stripDescriptionsFromTypeConfiguration(newConfiguration.items);
    }

    if (newConfiguration.contains) {
      newConfiguration.contains = stripDescriptionsFromTypeConfiguration(newConfiguration.contains);
    }
  }

  return newConfiguration;
}
