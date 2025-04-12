import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ImageStyleModule } from './image-style/image-style.module';

@Module({
  imports: [ImageStyleModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
