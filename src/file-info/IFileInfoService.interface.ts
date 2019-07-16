import { IFileInfo } from './IFileInfo.interface';

export interface IFileInfoService {

  getFileInfo(path: string): Promise<IFileInfo>;

}
