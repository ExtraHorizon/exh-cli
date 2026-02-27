import type { TemplateIn } from '@extrahorizon/javascript-sdk';
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

export async function create(data: TemplateIn) {
  return await getSdk().templates.create(data);
}

export async function update(id: string, data: TemplateIn) {
  return await getSdk().templates.update(id, data);
}

export async function remove(id: string) {
  return await getSdk().templates.remove(id);
}
