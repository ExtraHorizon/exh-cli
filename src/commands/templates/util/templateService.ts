import { OAuth1Client } from '@extrahorizon/javascript-sdk';
import { getSdk } from '../../../exh';

export class TemplateService {
  private sdk: OAuth1Client;

  constructor() {
    this.sdk = getSdk();
  }

  async byName(name: string) {
    return this.sdk.templates.findByName(name);
  }

  async update(name: string, data: any) {
    return this.sdk.templates.update(name, data);
  }

  async create(data: any) {
    return this.sdk.templates.create(data);
  }
}
