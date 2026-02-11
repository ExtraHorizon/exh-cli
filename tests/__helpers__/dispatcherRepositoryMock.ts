import * as dispatcherRepository from '../../src/repositories/dispatchers';
import { generateDispatcher } from './dispatchers';

export type DispatcherRepositoryMock = ReturnType<typeof dispatcherRepositoryMock>;

export const dispatcherRepositoryMock = () => {
  const existingDispatcher = generateDispatcher();

  jest.spyOn(dispatcherRepository, 'findAll')
    .mockResolvedValue([existingDispatcher, generateDispatcher()]);

  const updateDispatcherSpy = jest.spyOn(dispatcherRepository, 'update')
    .mockResolvedValue({ affectedRecords: 1 });

  const removeDispatcherSpy = jest.spyOn(dispatcherRepository, 'remove')
    .mockResolvedValue({ affectedRecords: 1 });

  const updateActionSpy = jest.spyOn(dispatcherRepository, 'updateAction')
    .mockResolvedValue({ affectedRecords: 1 });

  const removeActionSpy = jest.spyOn(dispatcherRepository, 'removeAction')
    .mockResolvedValue({ affectedRecords: 1 });

  return {
    existingDispatcher,
    updateDispatcherSpy,
    removeDispatcherSpy,
    updateActionSpy,
    removeActionSpy,
  };
};
