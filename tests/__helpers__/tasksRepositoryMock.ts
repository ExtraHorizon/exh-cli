import * as taskRepository from '../../src/repositories/tasks';
import { functionConfig, generateFunction } from './functions';

export const tasksRepositoryMock = () => {
  const existingFunction = generateFunction(functionConfig);

  const findFunctionsSpy = jest.spyOn(taskRepository.functions, 'find')
    .mockImplementation(() => Promise.resolve([]));

  const createFunctionSpy = jest.spyOn(taskRepository.functions, 'create')
    .mockImplementation(() => Promise.resolve(existingFunction));

  return {
    functionConfig,
    existingFunction,
    findFunctionsSpy,
    createFunctionSpy,
  };
};
