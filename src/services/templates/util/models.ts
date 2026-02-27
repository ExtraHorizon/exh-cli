import type { TemplateCreation, TemplateV2Creation } from '@extrahorizon/javascript-sdk';

export type TemplateConfig = TemplateV1Config | TemplateV2Config;

export interface TemplateV1Config extends TemplateCreation {
  version?: 1;
  $schema?: string;
  extends_template?: string;
}

export interface TemplateV2Config extends TemplateV2Creation {
  version?: 2;
  $schema?: string;
  extendsTemplate?: string;
}
