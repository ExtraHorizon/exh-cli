import { mkdir, writeFile } from 'fs/promises';
import * as osPath from 'path';
import { getSwaggerDocumentationUrl } from '../../helpers/util';

export async function init(name: string, path: string) {
  await mkdir(`${path}/${name}`, { recursive: true });

  const templatePath = osPath.join(path, `/${name}/template.json`);
  const bodyPath = osPath.join(path, `/${name}/body.hbs`);

  await writeFile(templatePath, JSON.stringify(createTemplate(name), null, 2));
  await writeFile(bodyPath, createBody());

  console.log(`✅  Successfully created ${templatePath}`);
  console.log(`✅  Successfully created ${bodyPath}`);
}

function createTemplate(name: string) {
  return {
    description: `The ${name} template`,
    inputs: {
      first_name: {
        type: 'string',
      },
      url: {
        type: 'string',
      },
    },
    outputs: {
      subject: 'Welcome {{@inputs.first_name}}',
    },
    $schema: getSwaggerDocumentationUrl('config-json-schemas/Template.json'),
  };
}

function createBody() {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <body>
    <p>Hello {{@inputs.first_name}},</p>
    <p>Welcome to our application!</p>
    <p>– The Team</p>
  </body>
</html>`;
}
