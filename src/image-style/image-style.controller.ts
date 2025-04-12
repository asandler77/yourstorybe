// ✅ image-style.controller.ts
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ImageStyleService } from './image-style.service';
import { extname } from 'path';

@Controller('image-style')
export class ImageStyleController {
  constructor(private readonly imageStyleService: ImageStyleService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${file.originalname}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { style: string },
  ) {
    try {
      const imageUrl = await this.imageStyleService.paintImage(
        body.style,
        file.path,
      );
  
      return {
        message: 'Image styled successfully',
        style: body.style,
        resultUrl: imageUrl,
      };
    } catch (error) {
      console.error('[uploadImage] Error:', error);
  
      return {
        message: 'Failed to style image',
        error: error?.message || 'Unknown error',
      };
    }
  }
  
}