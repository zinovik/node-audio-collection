import { ICollector } from './ICollector.interface';
import { IFileSystemService } from '../file-system/IFileSystemService.interface';
import { IMetadataService } from '../metadata/IMetadataService.interface';
import { IFormatService } from '../format/IFormatService.interface';
import { NoPathError } from './error/BadResponseError';
import { IFolder } from '../common/model/IFolder.interface';

export class Collector implements ICollector {
  constructor(private fileSystemService: IFileSystemService, private metadataService: IMetadataService, private formatService: IFormatService) {}

  async collect(path: string, folderName: string): Promise<void> {
    if (!path || !folderName) {
      throw new NoPathError();
    }

    let emptyTree: IFolder;
    let tree: IFolder;

    try {
      console.log('building folders and files tree...\n');
      emptyTree = await this.getTree(path, folderName);
    } catch (error) {
      console.log(error.message);
      return;
    }
    console.log('the folders and files tree was successfully builded\n');

    try {
      console.log('filling the tree with metadata...\n');
      tree = await this.fillTree(emptyTree);
    } catch (error) {
      console.log(error.message);
      return;
    }
    console.log('the tree was successfully filled...\n');

    console.log('formatting the tree...\n');
    const formatted = this.formatService.format(tree);
    console.log('the tree was successfully formated\n');

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

  private async fillTree(folder: IFolder): Promise<IFolder> {
    console.log(`Processing folder: ${folder.path}/${folder.name}`);

    const subFolders: IFolder[] = [];

    for (const currentFolder of folder.subFolders) {
      const subFolderWithData = await this.fillTree(currentFolder);
      subFolders.push(subFolderWithData);
    }

    let genre = '';
    let duration = 0;

    if (subFolders.length) {
      for (const subFolder of subFolders) {
        duration += subFolder.duration || 0;
      }
    }

    if (folder.filesNames.length) {
      for (const file of folder.filesNames) {
        const fileMetadata = await this.metadataService.getMetadata(`${folder.path}/${folder.name}/${file}`);

        if (!genre) {
          genre = fileMetadata.genre;
        }

        duration += fileMetadata.duration;
      }
    }

    return { ...folder, subFolders, genre, duration };
  }
}
