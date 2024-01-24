import * as functionRepository from '../../src/repositories/functions';
import { functionConfig, generateFunction } from './functions';

export const tasksRepositoryMock = (update = false) => {
  const existingFunction = generateFunction(functionConfig);
  const findData = update ? [existingFunction] : [];

  const findFunctionsSpy = jest.spyOn(functionRepository, 'find')
    .mockImplementation(() => Promise.resolve(findData));

  const findFunctionByNameSpy = jest.spyOn(functionRepository, 'findByName')
    .mockImplementation(() => Promise.resolve(existingFunction));

  const createFunctionSpy = jest.spyOn(functionRepository, 'create')
    .mockImplementation(() => Promise.resolve(existingFunction));

  const updateFunctionSpy = jest.spyOn(functionRepository, 'update')
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
