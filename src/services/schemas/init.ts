import { writeFile, mkdir } from 'fs/promises';
import * as osPath from 'path';
import { getSwaggerDocumentationUrl } from '../../helpers/util';

export async function init(name: string, path: string) {
  await mkdir(path, { recursive: true });
  const filePath = osPath.join(path, `${name}.json`);

  await writeFile(filePath, JSON.stringify(createSchema(name), null, 2));

  console.log(`✅  Successfully created ${filePath}`);
}

function createSchema(name: string) {
  return {
    name,
    description: `The ${name} schema`,
    createMode: 'allUsers',
    readMode: ['creator'],
    updateMode: ['creator'],
    deleteMode: ['creator'],
    statuses: {
      new: {},
    },
    creationTransition: {
      type: 'manual',
      toStatus: 'new',
    },
    transitions: [],
    properties: {
      firstProperty: {
        type: 'string',
      },
    },
    $schema: getSwaggerDocumentationUrl('config-json-schemas/Schema.json'),
  };
}
