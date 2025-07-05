import { Module } from '@nestjs/common';
import { ImageController } from './replicate.controller';
import { ReplicateService } from './replicate.service';

@Module({
  controllers: [ImageController],
  providers: [ReplicateService],
})
export class ReplicateModule {}
