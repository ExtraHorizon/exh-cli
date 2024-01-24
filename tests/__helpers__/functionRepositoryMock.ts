import * as functionRepository from '../../src/repositories/functions';
import { functionConfig, generateFunction } from './functions';

export const functionRepositoryMock = () => {
  const existingFunction = generateFunction(functionConfig);

  const findSpy = jest.spyOn(functionRepository, 'find')
    .mockImplementation(() => Promise.resolve([]));

  const findByNameSpy = jest.spyOn(functionRepository, 'findByName')
    .mockImplementation(() => Promise.resolve(existingFunction));

  const createSpy = jest.spyOn(functionRepository, 'create')
    .mockImplementation(() => Promise.resolve(existingFunction));

  const updateSpy = jest.spyOn(functionRepository, 'update')
    .mockImplementation(() => Promise.resolve({ affectedRecords: 1 }));

  return {
    functionConfig,
    existingFunction,
    findSpy,
    findByNameSpy,
    createSpy,
    updateSpy,
  };
};
