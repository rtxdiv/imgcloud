import { Body, Controller, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, Post, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ImageService } from './image.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 10))
  async upload(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: any
  ) {
    const resp = await this.imageService.upload(files, body.user_id)
    return resp
  }

  @Get(':id')
  async getImage(@Param('id') id: string, @Res() res: Response) {
    const path = await this.imageService.getPath(id)
    res.sendFile(path)
  }
}
