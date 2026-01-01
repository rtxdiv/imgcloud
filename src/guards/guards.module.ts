import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Images } from 'src/entity/images.entity';
import { UserGuard } from './user.guard';

@Module({
    imports: [
        TypeOrmModule.forFeature([Images])
    ],
    providers: [UserGuard],
    exports: [UserGuard]
})
export class GuardsModule {}
