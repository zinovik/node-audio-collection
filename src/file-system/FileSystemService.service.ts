import * as fs from 'fs';
import { promisify } from 'util';

import { IFileSystemService } from './IFileSystemService.interface';

export class FileSystemService implements IFileSystemService {
  async getFolderContents(path: string): Promise<{ subFoldersNames: string[]; filesNames: string[] }> {
    const foldersAndFilesNames = await promisify(fs.readdir)(path);

    const subFoldersNames = [];
    const filesNames = [];

    for (const folderOrFileName of foldersAndFilesNames) {
      const stats = await promisify(fs.lstat)(`${path}/${folderOrFileName}`);

      if (stats.isDirectory()) {
        subFoldersNames.push(folderOrFileName);
      }

      if (stats.isFile()) {
        filesNames.push(folderOrFileName);
      }
    }

    return { subFoldersNames, filesNames };
  }

  async writeListToFile(filename: string, list: string): Promise<void> {
    await promisify(fs.writeFile)(filename, list);
  }
}
