import * as mockFs from 'mock-fs';
import { flatListFiles } from '../listFilesInDir';

describe('listFilesInDir', () => {
  beforeEach(() => {
    mockFs({
      'path/to/fake/dir': {
        'some-file.txt': 'file content here',
        'first-json-file.json': 'json file here',
        'a-directory': {
          'some-file.txt': 'file content here',
          'second-json-file.json': 'json file here',
        },
        'empty-directory': {},
      },
    });
  });

  afterEach(() => {
    mockFs.restore();
  });

  it('Returns a flat array of only json files', () => {
    expect(flatListFiles('path/to/fake/dir', '.json')).toStrictEqual([
      'path/to/fake/dir/a-directory/second-json-file.json',
      'path/to/fake/dir/first-json-file.json',
    ]);
  });

  it('Returns a flat array of all files', () => {
    expect(flatListFiles('path/to/fake/dir')).toStrictEqual([
      'path/to/fake/dir/a-directory/second-json-file.json',
      'path/to/fake/dir/a-directory/some-file.txt',
      'path/to/fake/dir/first-json-file.json',
      'path/to/fake/dir/some-file.txt',
    ]);
  });

  it('Returns an empty flat array of jpg files', () => {
    expect(flatListFiles('path/to/fake/dir', '.jpg')).toStrictEqual([]);
  });
});
