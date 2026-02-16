import * as fs from 'fs';
import * as ospath from 'path';
import { buildTemplates } from './util/buildTemplates';
import { readTemplateFiles, readTemplateFolder, readAndValidateTemplateJson } from './util/readTemplateFiles';
import { uploadTemplate } from './util/uploadTemplate';
import { removeFileNameExtension } from './util/utils';

export async function sync(path?: string, template?: string) {
  if (path) {
    await syncTargetDir(ospath.resolve(path));
    return;
  }

  let templ = null;
  if (fs.statSync(ospath.join(process.cwd(), template)).isFile()) {
    /* In case a template file was provided */
    templ = await readAndValidateTemplateJson(template);
  } else {
    templ = await readTemplateFolder(template);
  }

  const templateName = removeFileNameExtension(ospath.basename(template));
  await buildAndUploadTemplates({ [templateName]: templ });
}

async function buildAndUploadTemplates(templateObject: any) {
  const templates = await buildTemplates(templateObject);
  for (const template of templates) {
    await uploadTemplate(template);
  }
}

export async function syncTargetDir(targetDir: string) {
  const templateFilesByName = await readTemplateFiles(targetDir);
  await buildAndUploadTemplates(templateFilesByName);
}
