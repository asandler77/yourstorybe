import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ImageStyleModule } from './image-style/image-style.module';
import { ReplicateService } from './replicate/replicate.service';
import { LeonardoModule } from './leonardo/leonardo.module';
import { PicsartModule } from './picsart/picsart.module';
import {ReplicateModule} from './replicate/replicate.module'

@Module({
  imports: [ImageStyleModule, LeonardoModule, PicsartModule, ReplicateModule],
  controllers: [AppController],
  providers: [AppService, ReplicateService],
})
export class AppModule {}
