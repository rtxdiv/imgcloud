import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Images } from 'src/entity/images.entity';
import { GuardsModule } from 'src/guards/guards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Images]),
    GuardsModule
  ],
  controllers: [ImageController],
  providers: [ImageService],
})
export class ImageModule {}
