import * as ospath from 'path';
import * as fs from 'fs';
import { epilogue } from '../../helpers/util';
import { readTemplateFiles, readTemplateJson } from './util/readTemplateFiles';
import { buildTemplates } from './util/buildTemplates';
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
  file: {
    demandOption: false,
    describe: 'Template file to sync',
    type: 'string',
  },
}).check(({ path, file }) => {
  if (file && (!fs.existsSync(ospath.join(process.cwd(), file)) || !fs.statSync(ospath.join(process.cwd(), file)).isFile())) {
    throw new Error('please provide a valid file path for your template');
  }
  if (path && (!fs.existsSync(ospath.join(process.cwd(), path)) || fs.statSync(ospath.join(process.cwd(), path)).isFile())) {
    console.log(ospath.join(process.cwd(), path));
    throw new Error('please provide a valid directory path for your code');
  }

  if ((file && path) || (!file && !path)) {
    throw new Error('Either path or file must be specified (but not both at the same time)');
  }
  return true;
});

export const handler = async ({ sdk, path, file }) => {
  const service: TemplateService = new TemplateService(sdk);
  if (path) {
    await syncTargetDir(service, ospath.resolve(path || '.'));
  } else if (file.endsWith('.json')) {
    const templateName = removeFileNameExtension(ospath.basename(file));
    const template = await readTemplateJson(file);
    await buildAndUploadTemplates(service, { [templateName]: template });
  }
};

async function buildAndUploadTemplates(service: TemplateService, templateObject: any) {
  console.log(templateObject);
  const templates = await buildTemplates(service, templateObject);
  for (const template of templates) {
    await uploadTemplate(service, template);
  }
}

async function syncTargetDir(service: TemplateService, targetDir: string) {
  const templateFilesByName = await readTemplateFiles(targetDir);
  await buildAndUploadTemplates(service, templateFilesByName);
}
