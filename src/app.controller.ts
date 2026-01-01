import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import type { Response } from 'express';
import path from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getMainPage(@Res() res: Response) {
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'))
  }
}
