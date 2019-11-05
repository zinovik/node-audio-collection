import * as musicMetadata from 'music-metadata';

import { IMetadataService } from './IMetadataService.interface';
import { IMetadata } from './model/IMetadata.interface';

export class MetadataService implements IMetadataService {
  async getMetadata(path: string): Promise<IMetadata> {
    return new Promise((resolve, reject) => {
      if (!path.endsWith('.mp3')) {
        return resolve({ genre: '', duration: 0 });
      }

      musicMetadata
        .parseFile(path)
        .then(metadata => {
          resolve({
            genre: (metadata.common.genre || []).join(', '),
            duration: metadata.format.duration || 0,
          });
        })
        .catch(error => {
          reject(error);
        });
    });
  }
}
