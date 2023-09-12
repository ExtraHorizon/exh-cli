import { MailAction, MailActionCreation, MailActionUpdate } from './MailAction';
import { TaskAction, TaskActionCreation, TaskActionUpdate } from './TaskAction';

export type Action = MailAction | TaskAction;
export type ActionCreation = MailActionCreation | TaskActionCreation;
export type ActionUpdate = MailActionUpdate | TaskActionUpdate;
