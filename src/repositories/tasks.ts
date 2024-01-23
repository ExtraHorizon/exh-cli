import { OAuth1Client, OptionsWithRql } from '@extrahorizon/javascript-sdk';
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

export const functions = ({
  async find(sdk: OAuth1Client, options?: OptionsWithRql) {
    const response = await sdk.raw.get(`/tasks/v1/functions${options?.rql || ''}`);
    return response.data;
  },
  async findByName(sdk: OAuth1Client, name: string) {
    const response = await sdk.raw.get(`/tasks/v1/functions${name}`);
    return response.data;
  },
  async findFirst(sdk: OAuth1Client, options?: OptionsWithRql) {
    const response = await this.find(sdk, options);
    return response.data ? response.data[0] : response.data;
  },
  async create(sdk: OAuth1Client, data: FunctionCreation) {
    const response = await sdk.raw.post('/tasks/v1/functions', data);
    return response.data;
  },
  async update(sdk: OAuth1Client, data: FunctionCreation) {
    const response = await sdk.raw.put(`/tasks/v1/functions/${data.name}`, data);

    if (response.data?.affectedRecords) {
      throw new Error(`Failed to update task ${data.name}`);
    }

    return response.data;
  },
});
