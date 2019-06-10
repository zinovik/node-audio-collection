import * as fs from 'fs';

/* tslint:disable */
const NodeID3 = require('node-id3');
const mp3Duration = require('mp3-duration');
/* tslint:enable */

import { ITag } from './ITag.interface';

const MUSIC_DIR = 'TestMusicFolder';

const file = `${__dirname}/../${MUSIC_DIR}/TestArtist/TestAlbum/sample.mp3`;

NodeID3.read(file, (err: any, tags: ITag) => {
  console.log('Artist', tags && tags.artist);
  console.log('Album', tags && tags.album);
});

mp3Duration(file, (err: any, duration: any) => {
  if (err) {
    return console.log(err.message);
  }

  console.log('Your file is ' + duration + ' seconds long');
});

fs.readdir(`${__dirname}/../${MUSIC_DIR}`, (err: any, files: any) => {
  if (err) {
    return console.log('Unable to scan directory: ' + err);
  }
  files.forEach((curFile: any) => {
    console.log(curFile);
    fs.lstat(`${__dirname}/../${MUSIC_DIR}/${curFile}`, (err: any, stat: any) => {
      console.log(111, stat.isFile());
      console.log(222, stat.isDirectory());
    });
  });
});
