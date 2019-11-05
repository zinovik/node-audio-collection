import * as moment from 'moment';

import { IFormatService } from './IFormatService.interface';
import { IFolder } from '../common/model/IFolder.interface';

const DURATION_FORMAT = 'HH:mm:ss.SSS';
const SPACE_LENGTH = 5;

export class FormatService implements IFormatService {
  private maxNameLength = 0;
  private maxGenreLength = 0;
  private dashesLength = 0;

  format(folder: IFolder, level = 0): string {
    let treeFormatted = '';

    if (!level) {
      this.maxNameLength = this.getMaxNameLength(folder);
      this.maxGenreLength = this.getMaxGenreLength(folder);
      this.dashesLength = this.getDashesLength();

      treeFormatted += '-'.repeat(this.dashesLength);
      treeFormatted += '\n';
    }

    let line = `${level ? '  '.repeat(level) : ''}${folder.name}`.padEnd(this.maxNameLength + SPACE_LENGTH, ' ');

    if (folder.duration) {
      line += `${this.formatDuration(folder.duration)}`.padEnd(DURATION_FORMAT.length + SPACE_LENGTH, ' ');
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
      treeFormatted += '-'.repeat(this.dashesLength);
    }

    return treeFormatted;
  }

  private getMaxNameLength(tree: IFolder): number {
    // TODO
    return 104;
  }

  private getMaxGenreLength(tree: IFolder): number {
    // TODO
    return 33;
  }

  private getDashesLength(): number {
    return this.maxNameLength + DURATION_FORMAT.length + SPACE_LENGTH * 2 + this.maxGenreLength;
  }

  private formatDuration(duration: number): string {
    if (duration > 60 * 60 * 24) {
      return '';
    }

    return moment.utc(duration * 1000).format(DURATION_FORMAT);
  }
}
