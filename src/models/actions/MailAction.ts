import { ActionBase, ActionType } from './ActionBase';

export interface MailActionCreation {
  type: ActionType.MAIL;
  name?: string;
  description?: string;
  recipients: {
    to: string[];
    cc?: string[];
    bcc?: string[];
  };
  templateId: string;
}

export interface MailActionUpdate {
  name?: string;
  description?: string;
  recipients?: {
    to: string[];
    cc?: string[];
    bcc?: string[];
  };

  templateId?: string;
}
export interface MailAction extends ActionBase, MailActionCreation {}
