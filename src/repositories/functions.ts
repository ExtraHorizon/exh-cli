import { permissionModes } from '../commands/tasks/taskConfig';
import { getSdk } from '../exh';

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
    permissionMode?: permissionModes;
    defaultPriority?: number;
  };
  retryPolicy?: {
    enabled: boolean;
    errorsToRetry: string[];
  };
}
export async function find() {
  // This endpoint does not consider RQL
  const response = await getSdk().raw.get('/tasks/v1/functions');
  return response.data.data;
}

export async function findByName(name: string) {
  const response = await getSdk().raw.get(`/tasks/v1/functions/${name}`, { customResponseKeys: ['*'] })
    .catch(e => e);

  if (response.status === 404) {
    return undefined;
  }

  return response.data;
}

export async function create(data: FunctionCreation) {
  const response = await getSdk().raw.post('/tasks/v1/functions', data);
  return response.data;
}

export async function update(data: FunctionCreation) {
  const response = await getSdk().raw.put(`/tasks/v1/functions/${data.name}`, data);
  return response.data;
}

export async function remove(name: string) {
  const response = await getSdk().raw.delete(`/tasks/v1/functions/${name}`);
  return response.data;
}
