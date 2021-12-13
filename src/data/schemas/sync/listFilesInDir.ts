import * as path from 'path';
import { readdirSync, statSync } from 'fs';

/**
 * recursively list files inside a target dir
 * @param {string} dirPath path to the target directory, can be a relative path from where the function is called
 * @returns {string[]} the flattened list of file paths inside the directory
 */
export async function flatListFiles(dirPath) {
    let buffer = [];

    const files = readdirSync(dirPath);

    for (const fileName of files) {
        const filePath = path.join(dirPath, fileName);
        const fileStat = statSync(filePath);
        
        // check if the target file is a directory
        if (fileStat.isDirectory()) {
                        
            // parse list files inside dirs recursively
            let fileArray = await flatListFiles(filePath);
            fileArray.map(string => path.join(filePath, string));

            // append result to buffer
            buffer.push(...fileArray);
            
        } else if (fileStat.isFile()){
            buffer.push(filePath);
        }
        
    }

    return buffer;
}