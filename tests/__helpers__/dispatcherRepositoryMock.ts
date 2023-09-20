import * as dispatcherRepository from '../../src/repositories/dispatchers';
import { generateDispatcher } from './dispatchers';

export const dispatcherRepositoryMock = () => {
  const existingDispatcher = generateDispatcher();

  jest.spyOn(dispatcherRepository, 'findAll')
    .mockImplementation(() => Promise.resolve([existingDispatcher, generateDispatcher()]));

  const updateDispatcherSpy = jest.spyOn(dispatcherRepository, 'update')
    .mockImplementation(() => Promise.resolve({ affectedRecords: 1 }));

  const updateActionSpy = jest.spyOn(dispatcherRepository, 'updateAction')
    .mockImplementation(() => Promise.resolve({ affectedRecords: 1 }));

  const deleteActionSpy = jest.spyOn(dispatcherRepository, 'deleteAction')
    .mockImplementationOnce(() => Promise.resolve({ affectedRecords: 1 }));

  return {
    existingDispatcher,
    updateDispatcherSpy,
    updateActionSpy,
    deleteActionSpy,
  };
};
