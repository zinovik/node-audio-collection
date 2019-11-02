import * as mm from 'music-metadata';

import { ITagsService } from './ITagsService.interface';
import { ITags } from './model/ITags.interface';

export class MetadataService implements ITagsService {
  async getTags(path: string): Promise<ITags> {
    return new Promise((resolve, reject) => {
      if (!path.endsWith('.mp3')) {
        return {};
      }

      mm.parseFile(path)
        .then(metadata => {
          resolve({ genre: metadata.common.genre![0] });
        })
        .catch(error => {
          reject(error);
        });
    });
  }
}
