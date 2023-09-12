import { ActionBase, ActionType } from './ActionBase';

export interface TaskActionCreation {
  type: ActionType.TASK;
  name?: string;
  description?: string;
  functionName: string;
  data?: { [key: string]: any; };
  tags?: string [];
  startTimestamp?: Date;
}

export interface TaskActionUpdate {
  name?: string;
  description?: string;
  functionName?: string;
  data?: { [key: string]: any; };
  tags?: string [];
  startTimestamp?: Date;
}
export interface TaskAction extends ActionBase, TaskActionCreation {}
