import * as fs from 'fs';
import {promisify} from 'util';

const readFile = promisify(fs.readFile);

export async function readJsonFile(filePath){
    const file = await readFile(filePath);
    return JSON.parse(file.toString());
}