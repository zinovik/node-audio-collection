import { ICollector } from './ICollector.interface';
import { IFileSystemService } from '../file-system/IFileSystemService.interface';
import { ITagsService } from '../tags/ITagsService.interface';
import { IFileInfoService } from '../file-info/IFileInfoService.interface';
import { IFormatService } from '../format/IFormatService.interface';

import { IFolder } from '../common/IFolder.interface';

export class Collector implements ICollector {
  constructor(
    private fileSystemService: IFileSystemService,
    private tagsService: ITagsService,
    private fileInfoService: IFileInfoService,
    private formatService: IFormatService,
  ) {}

  async collect(path: string, folderName: string): Promise<void> {
    const emptyTree = await this.getTree(path, folderName);

    const tree = await this.fillTree(emptyTree);

    const formatted = this.formatService.format(tree);

    await this.fileSystemService.writeListToFile('node-audio-collection.txt', formatted);
    console.log(formatted);
    console.log('\n');
    console.log('collection was saved to file node-audio-collection.txt');
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
    const subFolders: IFolder[] = [];

    for (const currentFolder of folder.subFolders) {
      const folderWithData = await this.fillTree(currentFolder);
      subFolders.push(folderWithData);
    }

    let genre: string | undefined;
    let duration = 0;

    if (folder.filesNames.length) {
      try {
        if (folder.filesNames[0].endsWith('mp3')) {
          ({ genre } = await this.tagsService.getTags(`${folder.path}/${folder.name}/${folder.filesNames[0]}`));
        }
      } catch {
        genre = '';
      }

      for (const file of folder.filesNames) {
        if (file.endsWith('mp3')) {
          duration += (await this.fileInfoService.getFileInfo(`${folder.path}/${folder.name}/${file}`)).duration;
        }
      }
    }

    return { ...folder, subFolders, genre, duration };
  }
}
