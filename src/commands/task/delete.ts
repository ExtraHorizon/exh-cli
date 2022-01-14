import { epilogue } from '../../helpers/util';

export const command = 'delete';
export const desc = 'Delete a task';
export const builder = (yargs: any) => epilogue(yargs).option('name', {
  demandOption: true,
  description: 'The name of the task',
  type: 'string',
});

export const handler = async ({ sdk, name }) => {
  const response = await sdk.raw.delete(`/tasks/v1/functions/${name}`);
  console.log(response.data);
};

