export interface ICollector {
  collect(path: string, folderName: string): Promise<void>;
}
