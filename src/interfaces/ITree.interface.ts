import { IArtist } from './IArtist.interface';

export interface ITree {
  duration: number;
  artists: IArtist[];
  albumsCount: number;
  songsCount: number;
}
