// src/image/image.controller.ts

import {
  Controller, Post, UploadedFile, UseInterceptors, Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReplicateService } from '../replicate/replicate.service';

@Controller('images')
export class ImageController {
  constructor(private replicateService: ReplicateService) {}

  @Post('transform')
  @UseInterceptors(FileInterceptor('image'))
  async transformImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('prompt') prompt: string,
  ) {
    const output = await this.replicateService.runInferenceWithImage({
      file,
      prompt,
    });
    return { output };
  }
}
