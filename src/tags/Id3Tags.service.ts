/* tslint:disable */
const NodeID3 = require('node-id3');
/* tslint:enable */

import { ITagsService } from './ITagsService.interface';
import { ITags } from './ITags.interface';

export class Id3TagsService implements ITagsService {
  async getTags(path: string): Promise<ITags> {
    return new Promise((resolve, reject) => {
      NodeID3.read(path, (error: any, tags: ITags | undefined) => {
        if (error) {
          reject(error);
        }

        resolve(tags || {});
      });
    });
  }
}
