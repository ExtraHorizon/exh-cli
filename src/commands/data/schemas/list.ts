import { epilogue } from '../../../helpers/util';
import * as schemaService from '../../../services/schemas';

export const command = 'list';
export const desc = 'List all schemas';
export const builder = (yargs: any) => epilogue(yargs);

export const handler = async function list({ isTTY }) {
  await schemaService.list(isTTY);
};
