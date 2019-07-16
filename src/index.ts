#!/usr/bin/env node
import * as moment from 'moment';

import { Collector } from './collector/Collector';
import { FileSystemService } from './file-system/FileSystemService.service';
import { Id3TagsService } from './tags/Id3Tags.service';
import { FileInfoService } from './file-info/FileInfo.service';
import { FormatService } from './format/Format.service';

const fileSystemService = new FileSystemService();
const id3TagsService = new Id3TagsService();
const fileInfoService = new FileInfoService();
const formatService = new FormatService();

const collector = new Collector(fileSystemService, id3TagsService, fileInfoService, formatService);

console.log('node-audio-collection started!\n');

const FOLDER_NAME = process.argv[2];

if (!FOLDER_NAME) {
  console.log('Please, provide music directory as a parameter!');
  throw new Error('Please, provide music directory as a parameter!');
}

(async () => {
  const dateStart = moment();

  await collector.collect(process.cwd(), FOLDER_NAME);

  const diff = moment().diff(dateStart);

  console.log('\n');
  console.log(`Total worked: ${moment.utc(diff).format('HH:mm:ss.SSS')}`);
})();
