import * as fs from 'fs';
import * as ospath from 'path';
import { epilogue } from '../../helpers/util';
import { buildTemplates } from './util/buildTemplates';
import { readTemplateFiles, readTemplateFolder, readTemplateJson } from './util/readTemplateFiles';
import { TemplateService } from './util/templateService';
import { uploadTemplate } from './util/uploadTemplate';
import { removeFileNameExtension } from './util/utils';

export const command = 'sync';
export const desc = 'Sync all templates in a directory with the ExH cloud';
export const builder = (yargs: any) => epilogue(yargs).options({
  path: {
    demandOption: false,
    describe: 'Directory containing the templates which need to be synced',
    type: 'string',
  },
  template: {
    demandOption: false,
    describe: 'Template file to sync',
    type: 'string',
  },
}).check(({ path, template }) => {
  if (template && !fs.existsSync(ospath.join(process.cwd(), template))) {
    throw new Error('please provide a valid file path for your template');
  }
  if (path && (!fs.existsSync(ospath.join(process.cwd(), path)) || fs.statSync(ospath.join(process.cwd(), path)).isFile())) {
    throw new Error('please provide a valid directory path for your code');
  }

  if ((template && path) || (!template && !path)) {
    throw new Error('Either path or template must be specified (but not both at the same time)');
  }
  return true;
});

export const handler = async ({ sdk, path, template }) => {
  const service: TemplateService = new TemplateService(sdk);
  if (path) {
    await syncTargetDir(service, ospath.resolve(path || '.'));
    return;
  }

  let templ = null;
  const templateName = removeFileNameExtension(ospath.basename(template));
  if (fs.statSync(ospath.join(process.cwd(), template)).isFile()) {
    /* In case a template file was provided */
    templ = await readTemplateJson(template);
  } else {
    templ = await readTemplateFolder(template);
  }
  await buildAndUploadTemplates(service, { [templateName]: templ });
};

async function buildAndUploadTemplates(service: TemplateService, templateObject: any) {
  const templates = await buildTemplates(service, templateObject);
  for (const template of templates) {
    await uploadTemplate(service, template);
  }
}

export async function syncTargetDir(service: TemplateService, targetDir: string) {
  const templateFilesByName = await readTemplateFiles(targetDir);
  await buildAndUploadTemplates(service, templateFilesByName);
}
