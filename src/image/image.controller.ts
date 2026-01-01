import { Controller, Get, Param, Post, Req, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ImageService } from './image.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Response, Request } from 'express';
import { UserGuard } from 'src/guards/user.guard';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('upload')
  @UseGuards(UserGuard)
  @UseInterceptors(FilesInterceptor('files', 10))
  async upload(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() req: Request
  ) {
    const resp = await this.imageService.upload(files, req.cookies.user_id)
    return resp
  }

  @Get(':id')
  async getImage(@Param('id') id: string, @Res() res: Response) {
    const path = await this.imageService.getPath(id)
    res.sendFile(path)
  }

  @Post('getAll')
  async getAll(@Req() req: Request) {
    return this.imageService.getAll(req.cookies.user_id)
  }
}
