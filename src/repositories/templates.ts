import { getSdk } from '../exh';

export async function findByName(name: string) {
  return await getSdk().templates.findByName(name);
}

export async function findById(id: string) {
  return await getSdk().templates.findById(id);
}

export async function findAll() {
  return await getSdk().templates.findAll();
}

export async function remove(id: string) {
  return await getSdk().templates.remove(id);
}
