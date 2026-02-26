import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import * as osPath from 'path';
import { ActionType } from '@extrahorizon/javascript-sdk';
import { getSwaggerDocumentationUrl } from '../../helpers/util';
import { DispatchersFile, readAndValidateDispatcherConfig } from './util/readDispatcherFile';

export async function init(name: string, path: string) {
  const filePath = osPath.join(path, 'dispatchers.json');
  const exists = existsSync(filePath);

  const fileContent: DispatchersFile & { '$schema': string; } = {
    dispatchers: [createDispatcher(name)],
    $schema: getSwaggerDocumentationUrl('config-json-schemas/Dispatchers.json'),
  };

  if (exists) {
    const existingDispatchers = await readAndValidateDispatcherConfig(filePath);
    fileContent.dispatchers.push(...existingDispatchers);
  } else {
    await mkdir(`${path}`, { recursive: true });
  }

  await writeFile(filePath, JSON.stringify(fileContent, null, 2));
  console.log(`✅  Successfully ${exists ? 'updated' : 'created'} ${filePath}`);
}

function createDispatcher(name: string) {
  return {
    eventType: 'my-custom-event',
    name,
    actions: [
      {
        type: ActionType.TASK,
        name: 'task-action',
        functionName: 'my-function-name',
      },
    ],
  };
}
