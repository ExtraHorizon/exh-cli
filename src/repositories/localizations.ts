import { Localization } from '@extrahorizon/javascript-sdk';
import { getSdk } from '../exh';

export async function create(localizations: PartialLocalization[]) {
  return await getSdk().localizations.create({ localizations });
}

export async function update(localizations: PartialLocalization[]) {
  return await getSdk().localizations.update({ localizations });
}

export type PartialLocalization = Pick<Localization, 'key' | 'text'>;
