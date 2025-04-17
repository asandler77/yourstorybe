import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ImageStyleModule } from './image-style/image-style.module';
import { ReplicateService } from './replicate/replicate.service';
import { ImageController } from './image/image.controller';
import { LeonardoModule } from './leonardo/leonardo.module';

@Module({
  imports: [ImageStyleModule, LeonardoModule],
  controllers: [AppController, ImageController],
  providers: [AppService, ReplicateService],
})
export class AppModule {}
