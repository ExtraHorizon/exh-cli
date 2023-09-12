export enum ActionType {
  MAIL = 'mail',
  TASK = 'task',
}

export interface ActionBase {
  id: string;
  name?: string;
  description?: string;
}
