export interface ICollector {
  collect(path: string, folderName: string, options?: string): Promise<void>;
}
