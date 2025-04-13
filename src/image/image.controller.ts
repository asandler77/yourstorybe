import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { ReplicateService } from '../replicate/replicate.service';
  
  @Controller('images')
  export class ImageController {
    constructor(private replicateService: ReplicateService) {}
  
    @Post('transform')
    @UseInterceptors(FileInterceptor('image'))
    async transformImage(@UploadedFile() file: Express.Multer.File) {
      const imageUrl = await this.replicateService.uploadToS3(file);
  
      const result = await this.replicateService.runInference({
        version: 'your-lora-model-version-id',
        input: {
          image: imageUrl,
          prompt: 'cartoon superhero style',
        },
      });
  
      return result;
    }
  }
  