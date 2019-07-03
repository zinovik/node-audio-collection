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

console.log('node audio collection started!');
console.log(`process.cwd(): ${process.cwd()}`);

if (!process.argv[2]) {
  console.log('Please, provide music directory as parameter');
  throw new Error();
}

const MUSIC_DIR = `${process.cwd()}/${process.argv[2]}`;

console.log(`Music directory: ${MUSIC_DIR}`);

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
  for (const artist of tree.artists) {
    console.log(`${artist.name.padEnd(53, ' ')}(${formatDuration(artist.duration)})`);

    for (const album of artist.albums) {
      console.log(`  ${album.name.padEnd(50, ' ')} (${formatDuration(album.duration)}) ${album.genre}`);
    }
  }
};

(async () => {

  const artistsNames = await getFolderContents({ path: MUSIC_DIR, isSkipFiles: true });

  const artists: IArtist[] = [];
  let totalDuration = 0;
  const artistsCount = artistsNames.length;
  let currentArtist = 0;

  for (const artist of artistsNames) {
    console.log(`Artist: ${currentArtist++} / ${artistsCount}`);

    const albumsNames = await getFolderContents({ path: `${MUSIC_DIR}/${artist}`, isSkipFiles: true });

    const albums: IAlbum[] = [];
    let artistDuration = 0;
    const albumsCount = albumsNames.length;
    let currentAlbum = 1;

    for (const album of albumsNames) {
      console.log(` Album: ${currentAlbum++} / ${albumsCount}`);
      const songs = await getFolderContents({ path: `${MUSIC_DIR}/${artist}/${album}`, isSkipFolders: true });

      const albumGenre = await getGenreFromFile(`${MUSIC_DIR}/${artist}/${album}/${songs[0]}`);
      let albumDuration = 0;

      for (const song of songs) {
        const duration = await getDurationFromFile(`${MUSIC_DIR}/${artist}/${album}/${song}`);

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
    artists,
    duration: totalDuration,
    albumsCount: 0,
    songsCount: 0,
  };

  formatTree(tree);
})();
