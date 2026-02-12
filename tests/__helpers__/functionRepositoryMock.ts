import * as functionRepository from '../../src/repositories/functions';
import { functionConfig, generateFunction } from './functions';

export type FunctionRepositoryMock = ReturnType<typeof functionRepositoryMock>;

export const functionRepositoryMock = () => {
  const existingFunction = generateFunction(functionConfig);

  const findSpy = jest.spyOn(functionRepository, 'find')
    .mockResolvedValue([]);

  const findByNameSpy = jest.spyOn(functionRepository, 'findByName')
    .mockResolvedValue(existingFunction);

  const createSpy = jest.spyOn(functionRepository, 'create')
    .mockResolvedValue(existingFunction);

  const updateSpy = jest.spyOn(functionRepository, 'update')
    .mockResolvedValue({ affectedRecords: 1 });

  const removeSpy = jest.spyOn(functionRepository, 'remove')
    .mockResolvedValue({ affectedRecords: 1 });
  return {
    functionConfig,
    existingFunction,
    findSpy,
    findByNameSpy,
    createSpy,
    updateSpy,
    removeSpy,
  };
};
