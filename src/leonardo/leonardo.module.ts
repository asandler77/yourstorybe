// src/leonardo/leonardo.module.ts
import { Module } from '@nestjs/common';
import { LeonardoController } from './leonardo.controller';
import { LeonardoService } from './leonardo.service';

@Module({
  controllers: [LeonardoController],
  providers: [LeonardoService],
  exports: [LeonardoService], // если нужно использовать в других модулях
})
export class LeonardoModule {}
