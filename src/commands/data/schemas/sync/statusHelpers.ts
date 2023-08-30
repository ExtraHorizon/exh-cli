import { isEqual } from 'lodash';
import { Changes } from '../util/syncSchema';

export function compareStatuses(localSchema: any, cloudSchema: any) {
  const changes: Changes = {
    toAdd: [],
    toUpdate: [],
    toRemove: [],
  };

  const cloudStatuses = cloudSchema.statuses;
  const localStatuses = localSchema.statuses;

  // Check local schema for statuses to be created or updated
  for (const statusName of Object.keys(localStatuses)) {
    const cloudStatus = cloudStatuses[statusName];
    const localStatus = localStatuses[statusName];

    // Status is to be created
    const isNewStatus = localStatus && !cloudStatus;
    if (isNewStatus) {
      changes.toAdd.push(statusName);
    }

    // Status is to be updated
    const isUpdatedStatus = localStatus && cloudStatus && !isEqual(localStatus, cloudStatus);
    if (isUpdatedStatus) {
      changes.toUpdate.push(statusName);
    }
  }

  // Check cloud schema for statuses to be removed
  for (const statusName of Object.keys(cloudStatuses)) {
    const cloudStatus = cloudStatuses[statusName];
    const localStatus = localStatuses[statusName];

    // Status is to be deleted
    const isExcessStatus = !localStatus && cloudStatus;
    if (isExcessStatus) {
      changes.toRemove.push(statusName);
    }
  }

  return changes;
}

export function calculateStatusUpdateData(localStatus: any, cloudStatus: any) {
  const result: Record<string, string> = {};

  // Add and update properties
  for (const key of Object.keys(localStatus)) {
    result[key] = localStatus[key];
  }

  // Remove excess properties by providing a null value
  for (const key of Object.keys(cloudStatus)) {
    const isExcessProperty = !localStatus[key];
    if (isExcessProperty) {
      result[key] = null;
    }
  }

  return result;
}
