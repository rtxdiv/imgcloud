import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ImageModule } from './image/image.module';
import path from 'path';
import { Images } from './entity/images.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_EXTERNAL_PORT),
      username: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      entities: [Images]
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(process.cwd(), 'public')
    }),
    ImageModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
