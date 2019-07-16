export interface IFileSystemService {
  getFolderContents(path: string): Promise<{ subFoldersNames: string[]; filesNames: string[] }>;
  writeListToFile(filename: string, list: string): Promise<void>;
}
