import * as dispatcherRepository from '../../src/repositories/dispatchers';
import { generateDispatcher } from './dispatchers';

export const dispatcherRepositoryMock = () => {
  const existingDispatcher = generateDispatcher();

  jest.spyOn(dispatcherRepository, 'findAll')
    .mockImplementation(() => Promise.resolve([existingDispatcher, generateDispatcher()]));

  const updateDispatcherSpy = jest.spyOn(dispatcherRepository, 'update')
    .mockImplementation(() => Promise.resolve({ affectedRecords: 1 }));

  const removeDispatcherSpy = jest.spyOn(dispatcherRepository, 'remove')
    .mockImplementation(() => Promise.resolve({ affectedRecords: 1 }));

  const updateActionSpy = jest.spyOn(dispatcherRepository, 'updateAction')
    .mockImplementation(() => Promise.resolve({ affectedRecords: 1 }));

  const removeActionSpy = jest.spyOn(dispatcherRepository, 'removeAction')
    .mockImplementationOnce(() => Promise.resolve({ affectedRecords: 1 }));

  return {
    existingDispatcher,
    updateDispatcherSpy,
    removeDispatcherSpy,
    updateActionSpy,
    removeActionSpy,
  };
};
