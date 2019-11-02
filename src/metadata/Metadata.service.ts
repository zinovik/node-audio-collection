import * as musicMetadata from 'music-metadata';

import { IMetadataService } from './IMetadataService.interface';

export class MetadataService implements IMetadataService {
  async getMetadata(path: string): Promise<musicMetadata.IAudioMetadata> {
    return new Promise((resolve, reject) => {
      if (!path.endsWith('.mp3')) {
        return resolve({ format: {}, common: {} } as any);
      }

      musicMetadata
        .parseFile(path)
        .then(metadata => {
          resolve(metadata);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
}
