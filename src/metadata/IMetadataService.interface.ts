import { IMetadata } from './model/IMetadata.interface';

export interface IMetadataService {
  getMetadata(path: string): Promise<IMetadata>;
}
