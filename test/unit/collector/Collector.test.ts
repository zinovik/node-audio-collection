import { IMock, Mock, It, Times } from 'typemoq';

import { Collector } from '../../../src/collector/Collector';
import { IFileSystemService } from '../../../src/file-system/IFileSystemService.interface';
import { IMetadataService } from '../../../src/metadata/IMetadataService.interface';
import { IFormatService } from '../../../src/format/IFormatService.interface';

import { NoPathError } from '../../../src/collector/error/BadResponseError';

test('create new instance', () => {
  expect(undefined).toBeUndefined();
});

describe('Collector', () => {
  let fileSystemServiceMock: IMock<IFileSystemService>;
  let metadataServiceMock: IMock<IMetadataService>;
  let formatServiceMock: IMock<IFormatService>;

  let collector: Collector;

  beforeEach(() => {
    fileSystemServiceMock = Mock.ofType<IFileSystemService>();
    metadataServiceMock = Mock.ofType<IMetadataService>();
    formatServiceMock = Mock.ofType<IFormatService>();

    collector = new Collector(fileSystemServiceMock.object, metadataServiceMock.object, formatServiceMock.object);
  });

  afterEach(() => {
    fileSystemServiceMock.verifyAll();
    metadataServiceMock.verifyAll();
    formatServiceMock.verifyAll();
  });

  it('Should throw an error if there is no current path', async () => {
    // Arrange
    const path = '';
    const folderName = 'Music';
    fileSystemServiceMockGetFolderContentsNeverCalled();
    metadataServiceMockGetMetadataNeverCalled();
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
    metadataServiceMockGetMetadataNeverCalled();
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

  function fileSystemServiceMockGetFolderContents({ subFoldersNames, filesNames }: { subFoldersNames: string[]; filesNames: string[] }) {
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
    fileSystemServiceMock.setup((x: IFileSystemService) => x.writeListToFile(It.isAny(), It.isAny())).verifiable(Times.never());
  }

  function metadataServiceMockGetMetadataNeverCalled() {
    metadataServiceMock.setup((x: IMetadataService) => x.getMetadata(It.isAny())).verifiable(Times.never());
  }

  function formatServiceMockFormatNeverCalled() {
    formatServiceMock.setup((x: IFormatService) => x.format(It.isAny())).verifiable(Times.never());
  }
});
