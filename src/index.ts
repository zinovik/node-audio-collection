#!/usr/bin/env node
import * as moment from 'moment';

import { Collector } from './collector/Collector';
import { FileSystemService } from './file-system/FileSystemService.service';
import { MetadataService } from './metadata/Metadata.service';
import { FormatService } from './format/Format.service';

const fileSystemService = new FileSystemService();
const metadataService = new MetadataService();
const formatService = new FormatService();

const collector = new Collector(fileSystemService, metadataService, formatService);

console.log('node-audio-collection started!\n');

(async () => {
  const dateStart = moment();

  await collector.collect(process.cwd(), process.argv[2]);

  const diff = moment().diff(dateStart);

  console.log(`\nTotal worked: ${moment.utc(diff).format('HH:mm:ss.SSS')}`);
})();
