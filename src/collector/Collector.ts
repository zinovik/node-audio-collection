import { ICollector } from './ICollector.interface';
import { IFileSystemService } from '../file-system/IFileSystemService.interface';
import { ITagsService } from '../tags/ITagsService.interface';
import { IFileInfoService } from '../file-info/IFileInfoService.interface';
import { IFormatService } from '../format/IFormatService.interface';
import { NoPathError } from './error/BadResponseError';
import { IFolder } from '../common/model/IFolder.interface';

export class Collector implements ICollector {
  constructor(
    private fileSystemService: IFileSystemService,
    private tagsService: ITagsService,
    private fileInfoService: IFileInfoService,
    private formatService: IFormatService,
  ) {}

  async collect(path: string, folderName: string): Promise<void> {
    if (!path || !folderName) {
      throw new NoPathError();
    }

    const emptyTree = await this.getTree(path, folderName);

    const tree = await this.fillTree(emptyTree);

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

  private async fillTree(folder: IFolder): Promise<IFolder> {
    console.log(`Processing folder: ${folder.path}/${folder.name}`);

    const subFolders: IFolder[] = [];

    for (const currentFolder of folder.subFolders) {
      const folderWithData = await this.fillTree(currentFolder);
      subFolders.push(folderWithData);
    }

    let genre: string | undefined;
    let duration = 0;

    if (folder.filesNames.length) {
      try {
        ({ genre } = await this.tagsService.getTags(`${folder.path}/${folder.name}/${folder.filesNames[0]}`));
      } catch {
        genre = '';
      }

      const fileInfoPromises = [];

      for (const file of folder.filesNames) {
        fileInfoPromises.push(this.fileInfoService.getFileInfo(`${folder.path}/${folder.name}/${file}`));
      }

      const filesInfos = await Promise.all(fileInfoPromises);
      duration += filesInfos.reduce((sum, fileInfo) => sum + fileInfo.duration, 0);
    }

    return { ...folder, subFolders, genre, duration };
  }
}
