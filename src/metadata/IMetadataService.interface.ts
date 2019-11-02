import * as musicMetadata from 'music-metadata';

export interface IMetadataService {
  getMetadata(path: string): Promise<musicMetadata.IAudioMetadata>;
}
