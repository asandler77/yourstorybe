import { Module } from '@nestjs/common';
import { ImageStyleController } from './image-style.controller';
import { ImageStyleService } from './image-style.service';

@Module({
  controllers: [ImageStyleController],
  providers: [ImageStyleService],
})
export class ImageStyleModule {}


