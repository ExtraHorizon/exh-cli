import * as taskRepository from '../../src/repositories/tasks';
import { functionConfig, generateFunction } from './functions';

export const tasksRepositoryMock = (update = false) => {
  const existingFunction = generateFunction(functionConfig);
  const findData = update ? [existingFunction] : [];

  const findFunctionsSpy = jest.spyOn(taskRepository.functions, 'find')
    .mockImplementation(() => Promise.resolve(findData));

  const findFunctionByNameSpy = jest.spyOn(taskRepository.functions, 'findByName')
    .mockImplementation(() => Promise.resolve(existingFunction));

  const createFunctionSpy = jest.spyOn(taskRepository.functions, 'create')
    .mockImplementation(() => Promise.resolve(existingFunction));

  const updateFunctionSpy = jest.spyOn(taskRepository.functions, 'update')
    .mockImplementation(() => Promise.resolve({ affectedRecords: 1 }));

  return {
    functionConfig,
    existingFunction,
    findFunctionsSpy,
    findFunctionByNameSpy,
    createFunctionSpy,
    updateFunctionSpy,
  };
};
