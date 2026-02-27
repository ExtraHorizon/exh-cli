import { epilogue } from '../../helpers/util';
import * as taskService from '../../services/tasks';

export const command = 'list';
export const desc = 'List all tasks';
export const builder = (yargs: any) => epilogue(yargs);

export const handler = async function list({ isTTY }) {
  await taskService.list(isTTY);
};
