import { Action, ActionCreation } from './actions';

export interface Dispatcher {
    id?: string;
    eventType?: string;
    name?: string;
    description?: string;
    actions?: Action[];
    tags?: string[];
    updateTimestamp?: number;
    creationTimestamp?: number;
}

export interface DispatcherCreationInput {
    eventType?: string;
    name?: string;
    description?: string;
    actions?: ActionCreation[];
    tags?: string[];
}

export type DispatcherUpdateInput = Omit<DispatcherCreationInput, 'actions'>;
