import { FunctionCreation, ResourceUnknownError } from '@extrahorizon/javascript-sdk';
import { getSdk } from '../exh';

export async function find() {
  // This endpoint does not consider RQL
  const response = await getSdk().tasks.functions.find();
  return response.data;
}

export async function findByName(name: string) {
  try {
    return getSdk().tasks.functions.getByName(name);
  } catch (e) {
    if (e instanceof ResourceUnknownError) {
      return undefined;
    }

    throw e;
  }
}

export async function create(data: FunctionCreation) {
  return getSdk().tasks.functions.create(data);
}

export async function update(data: Partial<FunctionCreation>) {
  return getSdk().tasks.functions.update(data.name, data);
}

export async function remove(name: string) {
  return getSdk().tasks.functions.remove(name);
}
