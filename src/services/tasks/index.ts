import * as chalk from 'chalk';
import * as functionRepository from '../../repositories/functions';

export { sync } from './sync';
export { init } from './init';
export { assertExecutionPermission } from './taskConfig';

export async function list(isTTY: boolean) {
  let functions: any[];
  try {
    functions = await functionRepository.find();
  } catch (err) {
    console.log(err);
    return;
  }

  if (functions.length < 1) {
    return;
  }

  if (isTTY) {
    console.table(functions.map((c:any) => ({
      Name: c.name,
      Description: c.description || '<none>',
      'Last updated': c.updateTimestamp.toISOString(),
    })));
  } else {
    functions.forEach((f:any) => (console.log(f.name)));
  }
}

export async function remove(name: string) {
  try {
    const response = await functionRepository.remove(name);
    if (response?.affectedRecords) {
      console.log(chalk.green('Successfully deleted task', name));
    } else {
      console.log(chalk.red('Failed to delete task', name));
    }
  } catch (err) {
    console.log(chalk.red('Failed to delete task:', err.message));
  }
}
