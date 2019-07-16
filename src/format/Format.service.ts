import * as moment from 'moment';

import { IFormatService } from './IFormatService.interface';
import { IFolder } from '../common/model/IFolder.interface';

export class FormatService implements IFormatService {
  format(folder: IFolder, level = 0): string {
    let treeFormatted = '';

    if (!level) {
      treeFormatted += '-'.repeat(140);
      treeFormatted += '\n';
    }

    let line = `${level ? '  '.repeat(level) : ''}${folder.name}`.padEnd(100, ' ');

    if (folder.duration) {
      line += `${this.formatDuration(folder.duration)}`.padEnd(20, ' ');
    }

    if (folder.genre) {
      line += folder.genre;
    }

    treeFormatted += line.trimRight();
    treeFormatted += '\n';

    for (const currentFolder of folder.subFolders) {
      treeFormatted += this.format(currentFolder, level + 1);
    }

    if (!level) {
      treeFormatted += '-'.repeat(140);
    }

    return treeFormatted;
  }

  private formatDuration(duration: number): string {
    return moment.utc(duration * 1000).format('HH:mm:ss.SSS');
  }
}
