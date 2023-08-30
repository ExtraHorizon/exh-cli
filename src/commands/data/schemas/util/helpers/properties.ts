import { isEqual } from 'lodash';
import { Changes } from '../syncSchema';

export function compareStatuses(localSchema: any, cloudSchema: any) {
  const changes: Changes = {
    toAdd: [],
    toUpdate: [],
    toRemove: [],
  };

  const cloudStatuses = cloudSchema.statuses;
  const localStatuses = localSchema.statuses;

  // Check local schema for statuses to be created or updated
  const localStatusKeys = Object.keys(localStatuses);
  for (const key of localStatusKeys) {
    const cloudStatus = cloudStatuses[key];
    const localStatus = localStatuses[key];

    // Status is to be created
    const isNewStatus = localStatus && !cloudStatus;
    if (isNewStatus) {
      changes.toAdd.push(key);
    }

    // Status is to be updated
    const isUpdatedStatus = localStatus && cloudStatus && !isEqual(localStatus, cloudStatus);
    if (isUpdatedStatus) {
      changes.toUpdate.push(key);
    }
  }

  // Check cloud schema for statuses to be removed
  const cloudStatusKeys = Object.keys(cloudStatuses);
  for (const key of cloudStatusKeys) {
    const cloudStatus = cloudStatuses[key];
    const localStatus = localStatuses[key];

    // Status is to be deleted
    const isExcessStatus = !localStatus && cloudStatus;
    if (isExcessStatus) {
      changes.toRemove.push(key);
    }
  }

  return changes;
}

export function calculateStatusProperties(localStatus: any, cloudStatus: any) {
  const result: Record<string, string> = {};

  // Add and update properties
  const localStatusKeys = Object.keys(localStatus);
  localStatusKeys.forEach(key => {
    result[key] = localStatus[key];
  });

  // Remove excess properties by providing a null value
  const cloudStatusKeys = Object.keys(cloudStatus);
  cloudStatusKeys.forEach(key => {
    const isExcessProperty = !localStatus[key];
    if (isExcessProperty) {
      result[key] = null;
    }
  });

  return result;
}
