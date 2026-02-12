import * as chalk from 'chalk';
import * as schemaRepository from '../../repositories/schemas';

export { init } from './init';
export { verify } from './verify';
export { sync } from './sync';

export async function list(isTTY?: boolean) {
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
}

export async function remove(id: string) {
  const disableResponse = await schemaRepository.disable(id);
  if (disableResponse.affectedRecords !== 1) {
    console.log(chalk.red('Failed to delete schema', id));
    return;
  }

  const deleteResponse = await schemaRepository.remove(id);
  if (deleteResponse.affectedRecords) {
    console.log(chalk.green('Successfully deleted schema', id));
  } else {
    console.log(chalk.red('Failed to delete schema', id));
  }
}
