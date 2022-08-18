import { createWriteStream, unlink } from 'fs';
import { tmpdir } from 'os';
import * as archiver from 'archiver';
import { v4 as uuidv4 } from 'uuid';

export async function zipFileFromDirectory(path: string): Promise<string> {
  return new Promise((res, rej) => {
    /* Create a temporary file */
    const tmpPath = `${tmpdir()}/${uuidv4()}`;
    const output = createWriteStream(tmpPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Sets the compression level.
    });

    output.on('close', () => {
      res(tmpPath);
    });
    archive.on('error', (err:any) => {
      unlink(tmpPath, msg => { console.log(msg); });
      rej(err);
    });

    archive.pipe(output);
    archive.directory(`${path}/`, false);
    archive.finalize();
  });
}
