import { epilogue } from '../../../helpers/util';
import * as schemaRepository from '../../../repositories/schemas';

export const command = 'list';
export const desc = 'List all schemas';
export const builder = (yargs: any) => epilogue(yargs);

export const handler = async function list({ isTTY }) {
  const schemas = await schemaRepository.fetchAll();

  if (schemas.length < 1) {
    return;
  }

  if (isTTY) {
    console.table(schemas.map(schema => ({
      Id: schema.id,
      Name: schema.name,
      Description: schema.description || '<none>',
    })));
  } else {
    schemas.forEach(schema => console.log(
      [schema.id, schema.name].join(',')
    ));
  }
};
