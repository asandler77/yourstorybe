import { Module } from '@nestjs/common';
import { PicsartController } from './picsart.controller';
import { PicsartService } from './picsart.service';

@Module({
  controllers: [PicsartController],
  providers: [PicsartService],
})
export class PicsartModule {}
