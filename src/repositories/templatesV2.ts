import type { TemplateV2Creation } from '@extrahorizon/javascript-sdk';
import { getSdk } from '../exh';

export async function findByName(name: string) {
  return await getSdk().templatesV2.findByName(name);
}

export async function findById(id: string) {
  return await getSdk().templatesV2.findById(id);
}

export async function findAll() {
  return await getSdk().templatesV2.findAll();
}

export async function create(data: TemplateV2Creation) {
  return await getSdk().templatesV2.create(data);
}

export async function update(id: string, data: Partial<TemplateV2Creation>) {
  return await getSdk().templatesV2.update(id, data);
}

export async function remove(id: string) {
  return await getSdk().templatesV2.remove(id);
}
