#!/usr/bin/env node
import * as fs from 'fs';
import * as moment from 'moment';
import { promisify } from 'util';

/* tslint:disable */
const NodeID3 = require('node-id3');
const mp3Duration = require('mp3-duration');
/* tslint:enable */

import { ITag } from './interfaces/ITag.interface';
import { ITree } from './interfaces/ITree.interface';
import { IArtist } from './interfaces/IArtist.interface';
import { IAlbum } from './interfaces/IAlbum.interface';

console.log('node-audio-collection started!\n');

const dateStart = moment();

const FOLDER_NAME = process.argv[2];
const IS_SKIP_DURATION = process.argv[3] === 'sd';

if (!FOLDER_NAME) {
  console.log('Please, provide music directory as a parameter!');
  throw new Error('Please, provide music directory as a parameter!');
}

const MUSIC_DIR = `${process.cwd()}/${FOLDER_NAME}`;

const getGenreFromFile = (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    NodeID3.read(filePath, (error: any, tags: ITag) => {
      if (error) {
        reject(error);
      }

      resolve(tags && tags.genre);
    });
  });
};

const getDurationFromFile = (filePath: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    mp3Duration(filePath, (error: any, duration: any) => {
      if (error) {
        reject(error);
      }

      resolve(duration);
    });
  });
};

const getFolderContents = async ({ path, isSkipFolders, isSkipFiles }: {
  path: string;
  isSkipFolders?: boolean;
  isSkipFiles?: boolean;
}): Promise<string[]> => {
  const foldersAndFilesNames = await promisify(fs.readdir)(path);

  const folderContents = [];

  for (const folderOrFileName of foldersAndFilesNames) {
    const stats = await promisify(fs.lstat)(`${path}/${folderOrFileName}`);

    if (!isSkipFolders && stats.isDirectory()) {
      folderContents.push(folderOrFileName);
    }

    if (!isSkipFiles && stats.isFile()) {
      folderContents.push(folderOrFileName);
    }
  }

  return folderContents;
};

const formatDuration = (duration: number): string => {
  return moment.utc(duration * 1000).format('HH:mm:ss.SSS');
};

const formatTree = (tree: ITree) => {
  let treeFormatted = `${tree.folder}\n`;
  treeFormatted += `${''.padEnd(140, '-')}\n`;

  for (const artist of tree.artists) {
    treeFormatted += `${artist.name.padEnd(112, ' ')}`;

    if (!IS_SKIP_DURATION) {
      treeFormatted += `(${formatDuration(artist.duration)})\n`;
    }

    treeFormatted += `\n`;

    for (const album of artist.albums) {
      treeFormatted += `  ${album.name.padEnd(110, ' ')}`;

      if (!IS_SKIP_DURATION) {
        treeFormatted += `(${formatDuration(album.duration)})`;
      }

      treeFormatted += ` ${album.genre}\n`;
    }
  }

  treeFormatted += `${''.padEnd(140, '-')}\n`;
  treeFormatted += `Artists: ${tree.artists.length}                    Albums: ${tree.albumsCount}                    Songs: ${tree.songsCount}`;

  if (!IS_SKIP_DURATION) {
    treeFormatted += `                    Duration: ${formatDuration(tree.duration)}`;
  }

  return treeFormatted;
};

const writeListToFile = async (list: string): Promise<void> => {
  await promisify(fs.writeFile)('node-audio-collection.txt', list);
};

(async () => {

  const artistsNames = await getFolderContents({ path: MUSIC_DIR, isSkipFiles: true });

  const artists: IArtist[] = [];
  let totalDuration = 0;
  let totalAlbumsCount = 0;
  let totalSongsCount = 0;
  const artistsCount = artistsNames.length;
  let currentArtist = 1;

  for (const artist of artistsNames) {
    console.log(`Artist ${currentArtist++} of ${artistsCount}`);

    const albumsNames = await getFolderContents({ path: `${MUSIC_DIR}/${artist}`, isSkipFiles: true });

    const albums: IAlbum[] = [];
    let artistDuration = 0;
    const albumsCount = albumsNames.length;
    totalAlbumsCount += albumsCount;
    let currentAlbum = 1;

    for (const album of albumsNames) {
      console.log(`                   Album ${currentAlbum++} of ${albumsCount}`);
      const songs = await getFolderContents({ path: `${MUSIC_DIR}/${artist}/${album}`, isSkipFolders: true });

      totalSongsCount += songs.length;

      const albumGenre = await getGenreFromFile(`${MUSIC_DIR}/${artist}/${album}/${songs[0]}`);
      let albumDuration = 0;

      for (const song of songs) {
        const duration = IS_SKIP_DURATION ? 0 : await getDurationFromFile(`${MUSIC_DIR}/${artist}/${album}/${song}`);

        albumDuration += duration;
      }

      artistDuration += albumDuration;

      albums.push({
        name: album,
        duration: albumDuration,
        genre: albumGenre,
      });
    }

    totalDuration += artistDuration;

    artists.push({
      name: artist,
      duration: artistDuration,
      albums,
    });

  }

  const tree: ITree = {
    folder: FOLDER_NAME,
    artists,
    duration: totalDuration,
    albumsCount: totalAlbumsCount,
    songsCount: totalSongsCount,
  };

  console.log('\n');
  console.log(formatTree(tree));
  await writeListToFile(formatTree(tree));
  console.log('\ncollection was saved to file node-audio-collection.txt\n');

  const diff = moment().diff(dateStart);
  const duration = moment.duration(diff);
  console.log(`Total worked: ${duration.humanize()}`);
})();
