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

(async () => {
  const dateStart = moment();

  await collector.collect(process.cwd(), process.argv[2]);

  const diff = moment().diff(dateStart);

  console.log(`\nTotal worked: ${moment.utc(diff).format('HH:mm:ss.SSS')}`);
})();
