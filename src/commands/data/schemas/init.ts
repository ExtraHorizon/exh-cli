import { writeFile, mkdir } from 'fs/promises';
import * as osPath from 'path';
import { epilogue, getSwaggerDocumentationUrl } from '../../../helpers/util';

export const command = 'init <name>';
export const desc = 'Create a basic schema configuration file';
export const builder = (yargs: any) => epilogue(yargs)
  .positional('name', {
    demandOption: true,
    description: 'The name of the new schema',
    type: 'string',
  })
  .options({
    path: {
      description: 'The path to the folder where the schema should be created',
      type: 'string',
      default: './schemas',
    },
  });

export const handler = async function init({ name, path }: { name: string; path: string; }) {
  await mkdir(path, { recursive: true });
  const filePath = osPath.join(path, `${name}.json`);

  await writeFile(filePath, JSON.stringify(createSchema(name), null, 2));

  console.log(`✅  Successfully created ${filePath}`);
};

function createSchema(name: string) {
  return {
    $schema: getSwaggerDocumentationUrl('config-json-schemas/Schema.json'),
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
  };
}
