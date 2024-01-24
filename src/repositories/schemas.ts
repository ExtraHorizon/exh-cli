import { OAuth1Client, ObjectId } from '@extrahorizon/javascript-sdk';

export async function remove(sdk: OAuth1Client, schemaId: ObjectId) {
  return await sdk.data.schemas.remove(schemaId);
}

export async function disable(sdk: OAuth1Client, schemaId: ObjectId) {
  return await sdk.data.schemas.disable(schemaId);
}
