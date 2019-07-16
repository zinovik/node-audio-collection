import { IMock, Mock, It, Times } from 'typemoq';

import { Collector } from '../../../src/collector/Collector';
import { IFileSystemService } from '../../../src/file-system/IFileSystemService.interface';
import { ITagsService } from '../../../src/tags/ITagsService.interface';
import { IFileInfoService } from '../../../src/file-info/IFileInfoService.interface';
import { IFormatService } from '../../../src/format/IFormatService.interface';

import { NoPathError } from '../../../src/collector/error/BadResponseError';

test('create new instance', () => {
  expect(undefined).toBeUndefined();
});

describe('Collector', () => {
  let fileSystemServiceMock: IMock<IFileSystemService>;
  let tagsServiceMock: IMock<ITagsService>;
  let fileInfoServiceMock: IMock<IFileInfoService>;
  let formatServiceMock: IMock<IFormatService>;

  let collector: Collector;

  beforeEach(() => {
    fileSystemServiceMock = Mock.ofType<IFileSystemService>();
    tagsServiceMock = Mock.ofType<ITagsService>();
    fileInfoServiceMock = Mock.ofType<IFileInfoService>();
    formatServiceMock = Mock.ofType<IFormatService>();

    collector = new Collector(
      fileSystemServiceMock.object,
      tagsServiceMock.object,
      fileInfoServiceMock.object,
      formatServiceMock.object,
    );
  });

  afterEach(() => {
    fileSystemServiceMock.verifyAll();
    tagsServiceMock.verifyAll();
    fileInfoServiceMock.verifyAll();
    formatServiceMock.verifyAll();
  });

  it('Should throw an error if there is no current path', async () => {
    // Arrange
    const path = '';
    const folderName = 'Music';
    fileSystemServiceMockGetFolderContentsNeverCalled();
    tagsServiceMockGetTagsNeverCalled();
    fileInfoServiceMockGetFileInfoNeverCalled();
    formatServiceMockFormatNeverCalled();
    fileSystemServiceMockWriteListToFileNeverCalled();

    // Act - Assert
    await expect(collector.collect(path, folderName)).rejects.toThrow(NoPathError);
  });

  it('Should throw an error if there is no music folder', async () => {
    // Arrange
    const path = '/';
    const folderName = '';
    fileSystemServiceMockGetFolderContentsNeverCalled();
    tagsServiceMockGetTagsNeverCalled();
    fileInfoServiceMockGetFileInfoNeverCalled();
    formatServiceMockFormatNeverCalled();
    fileSystemServiceMockWriteListToFileNeverCalled();

    // Act - Assert
    await expect(collector.collect(path, folderName)).rejects.toThrow(NoPathError);
  });

  it('Should create music collection', async () => {
    // Arrange
    const path = '.';
    const folderName = 'Music';
    fileSystemServiceMockGetFolderContents({
      subFoldersNames: [],
      filesNames: [],
    });

    // Act
    await collector.collect(path, folderName);

    // Assert
    expect(true).toBeTruthy();
  });

  function fileSystemServiceMockGetFolderContents({
    subFoldersNames,
    filesNames,
  }: {
    subFoldersNames: string[];
    filesNames: string[];
  }) {
    fileSystemServiceMock
      .setup((x: IFileSystemService) => x.getFolderContents('./Music'))
      .returns(async () => {
        return {
          subFoldersNames,
          filesNames,
        };
      })
      .verifiable(Times.once());
  }

  function fileSystemServiceMockGetFolderContentsNeverCalled() {
    fileSystemServiceMock.setup((x: IFileSystemService) => x.getFolderContents(It.isAny())).verifiable(Times.never());
  }

  function fileSystemServiceMockWriteListToFileNeverCalled() {
    fileSystemServiceMock
      .setup((x: IFileSystemService) => x.writeListToFile(It.isAny(), It.isAny()))
      .verifiable(Times.never());
  }

  function tagsServiceMockGetTagsNeverCalled() {
    tagsServiceMock.setup((x: ITagsService) => x.getTags(It.isAny())).verifiable(Times.never());
  }

  function fileInfoServiceMockGetFileInfoNeverCalled() {
    fileInfoServiceMock.setup((x: IFileInfoService) => x.getFileInfo(It.isAny())).verifiable(Times.never());
  }

  function formatServiceMockFormatNeverCalled() {
    formatServiceMock.setup((x: IFormatService) => x.format(It.isAny())).verifiable(Times.never());
  }
});
