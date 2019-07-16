/* tslint:disable */
const mp3Duration = require('mp3-duration');
/* tslint:enable */

import { IFileInfoService } from './IFileInfoService.interface';
import { IFileInfo } from './IFileInfo.interface';

export class FileInfoService implements IFileInfoService {
  async getFileInfo(path: string): Promise<IFileInfo> {
    return new Promise((resolve, reject) => {
      mp3Duration(path, (error: any, duration: any) => {
        if (error) {
          reject(error);
        }

        resolve({ duration });
      });
    });
  }
}
