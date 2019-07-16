import { IFolder } from '../common/IFolder.interface';

export interface IFormatService {
  format(folder: IFolder): string;
}
