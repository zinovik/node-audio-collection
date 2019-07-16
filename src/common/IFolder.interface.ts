export interface IFolder {
  name: string;
  path: string;
  subFolders: IFolder[];
  filesNames: string[];
  albumsCount?: number;
  songsCount?: number;
  duration?: number;
  genre?: string;
}
