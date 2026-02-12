import { epilogue } from '../../helpers/util';
import * as templateService from '../../services/templates';

export const command = 'list';
export const desc = 'List all templates';
export const builder = (yargs: any) => epilogue(yargs);

export const handler = async function list({ isTTY }: { isTTY: boolean; }) {
  await templateService.list(isTTY);
};
