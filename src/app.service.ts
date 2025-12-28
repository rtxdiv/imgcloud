import { Injectable, OnModuleInit } from '@nestjs/common';
import fs from 'fs'
import path from 'path';

@Injectable()
export class AppService implements OnModuleInit {
  onModuleInit() {
    const storagePath = path.normalize(process.env.STORAGE_PATH || process.cwd())
    if (!fs.existsSync(storagePath)) {
      fs.promises.mkdir(storagePath, { recursive: true })
    }
  }
}
