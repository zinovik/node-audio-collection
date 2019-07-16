import { ITags } from './model/ITags.interface';

export interface ITagsService {
  getTags(path: string): Promise<ITags>;
}
