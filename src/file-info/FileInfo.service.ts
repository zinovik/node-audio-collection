/* tslint:disable */
const mp3Duration = require('mp3-duration');
/* tslint:enable */

import { IFileInfoService } from './IFileInfoService.interface';
import { IFileInfo } from './model/IFileInfo.interface';

export class FileInfoService implements IFileInfoService {
  async getFileInfo(path: string): Promise<IFileInfo> {
    return new Promise((resolve, reject) => {
      if (!path.endsWith('.mp3')) {
        return resolve({ duration: 0 });
      }

      mp3Duration(path, (error: any, duration: any) => {
        if (error) {
          reject(error);
        }

        resolve({ duration });
      });
    });
  }
}
