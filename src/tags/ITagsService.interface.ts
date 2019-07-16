import { ITags } from './ITags.interface';

export interface ITagsService {

  getTags(path: string): Promise<ITags>;

}
