import { Localization, OAuth1Client } from '@extrahorizon/javascript-sdk';

export async function create(sdk: OAuth1Client, localizations: PartialLocalization[]) {
  return await sdk.localizations.create({ localizations });
}

export async function update(sdk: OAuth1Client, localizations: PartialLocalization[]) {
  return await sdk.localizations.update({ localizations });
}

export type PartialLocalization = Pick<Localization, 'key' | 'text'>;
