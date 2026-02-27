import * as dispatcherRepository from '../../src/repositories/dispatchers';
import { generateDispatcher } from './dispatchers';

export type DispatcherRepositoryMock = ReturnType<typeof dispatcherRepositoryMock>;

export const dispatcherRepositoryMock = () => {
  const existingDispatcher = generateDispatcher();

  const createSpy = jest.spyOn(dispatcherRepository, 'create')
    .mockImplementation(async data => ({
      ...data,
      id: 'new-dispatcher-id',
      actions: data.actions?.map(action => ({
        ...action,
        id: 'new-action-id',
        updateTimestamp: new Date(),
        creationTimestamp: new Date(),
      })),
      updateTimestamp: new Date(),
      creationTimestamp: new Date(),
    }));

  const findAllSpy = jest.spyOn(dispatcherRepository, 'findAll')
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
    createSpy,
    findAllSpy,
    updateDispatcherSpy,
    removeDispatcherSpy,
    updateActionSpy,
    removeActionSpy,
  };
};
