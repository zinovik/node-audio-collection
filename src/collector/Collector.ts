import { ICollector } from './ICollector.interface';
import { IFileSystemService } from '../file-system/IFileSystemService.interface';
import { IMetadataService } from '../metadata/IMetadataService.interface';
import { IFormatService } from '../format/IFormatService.interface';
import { NoPathError } from './error/BadResponseError';
import { IFolder } from '../common/model/IFolder.interface';

export class Collector implements ICollector {
  constructor(private fileSystemService: IFileSystemService, private metadataService: IMetadataService, private formatService: IFormatService) {}

  async collect(path: string, folderName: string, options?: string): Promise<void> {
    if (!path || !folderName) {
      throw new NoPathError();
    }

    let emptyTree: IFolder;

    try {
      emptyTree = await this.getTree(path, folderName);
    } catch (error) {
      console.log(error.message);
      return;
    }

    const tree = await this.fillTree(emptyTree, options !== undefined);

    const formatted = this.formatService.format(tree);

    await this.fileSystemService.writeListToFile('node-audio-collection.txt', formatted);
    console.log(`\n${formatted}`);
    console.log('\ncollection was saved to file node-audio-collection.txt');
  }

  private async getTree(path: string, folderName: string): Promise<IFolder> {
    const { subFoldersNames, filesNames } = await this.fileSystemService.getFolderContents(`${path}/${folderName}`);

    const subFolders: IFolder[] = [];

    for (const subFolderName of subFoldersNames) {
      subFolders.push(await this.getTree(`${path}/${folderName}`, subFolderName));
    }

    const clearFolder = {
      path,
      filesNames,
      subFolders,
      name: folderName,
    };

    return clearFolder;
  }

  private async fillTree(folder: IFolder, isSkip?: boolean): Promise<IFolder> {
    console.log(`Processing folder: ${folder.path}/${folder.name}`);

    const subFolders: IFolder[] = [];

    for (const currentFolder of folder.subFolders) {
      const folderWithData = await this.fillTree(currentFolder, isSkip);
      subFolders.push(folderWithData);
    }

    let genre: string[] | undefined = [];
    let duration = 0;

    if (folder.filesNames.length && !isSkip) {
      try {
        ({
          common: { genre },
        } = await this.metadataService.getMetadata(`${folder.path}/${folder.name}/${folder.filesNames[0]}`));
      } catch {
        //
      }

      for (const file of folder.filesNames) {
        duration += (await this.metadataService.getMetadata(`${folder.path}/${folder.name}/${file}`)).format.duration || 0;
      }
    }

    return { ...folder, subFolders, genre: genre && genre.join(''), duration };
  }
}
