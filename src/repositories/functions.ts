import { OAuth1Client } from '@extrahorizon/javascript-sdk';
import { permissionModes } from '../commands/tasks/taskConfig';

export interface FunctionCreation {
  name: string;
  description: string;
  entryPoint: string;
  code: string;
  runtime: string;
  timeLimit?: number;
  memoryLimit?: number;
  environmentVariables?: Record<string, any>;
  executionOptions?: {
    permissionMode: permissionModes;
  };
  retryPolicy?: {
    enabled: boolean;
    errorsToRetry: string[];
  };
}
export async function find(sdk: OAuth1Client) {
  // This endpoint does not consider RQL
  const response = await sdk.raw.get('/tasks/v1/functions');
  return response.data.data;
}
export async function findByName(sdk: OAuth1Client, name: string) {
  const response = await sdk.raw.get(`/tasks/v1/functions/${name}`);
  return response.data;
}
export async function create(sdk: OAuth1Client, data: FunctionCreation) {
  const response = await sdk.raw.post('/tasks/v1/functions', data);
  return response.data;
}
export async function update(sdk: OAuth1Client, data: FunctionCreation) {
  const response = await sdk.raw.put(`/tasks/v1/functions/${data.name}`, data);

  return response.data;
}
