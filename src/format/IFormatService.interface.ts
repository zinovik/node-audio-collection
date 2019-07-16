import { IFolder } from '../common/model/IFolder.interface';

export interface IFormatService {
  format(folder: IFolder): string;
}
