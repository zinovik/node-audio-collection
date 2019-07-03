import { IArtist } from './IArtist.interface';

export interface ITree {
  folder: string;
  duration: number;
  artists: IArtist[];
  albumsCount: number;
  songsCount: number;
}
