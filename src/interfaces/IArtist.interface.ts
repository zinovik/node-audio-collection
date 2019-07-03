import { IAlbum } from './IAlbum.interface';

export interface IArtist {
  name: string;
  duration: number;
  albums: IAlbum[];
}
