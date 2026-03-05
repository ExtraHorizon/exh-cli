import * as fileRepository from '../../src/repositories/files';

export type FileRepositoryMock = ReturnType<typeof fileServiceRepositoryMock>;

export const fileServiceRepositoryMock = () => {
  const updateFileServiceSettings = jest.spyOn(fileRepository, 'updateFileServiceSettings')
    .mockResolvedValue({
      affectedRecords: 1,
    });

  return {
    updateFileServiceSettings,
  };
};
