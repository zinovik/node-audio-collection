import { IFileInfo } from './model/IFileInfo.interface';

export interface IFileInfoService {
  getFileInfo(path: string): Promise<IFileInfo>;
}
