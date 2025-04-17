import { Controller, Post, Request, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LeonardoService } from './leonardo.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

@Controller('leonardo')
export class LeonardoController {
  constructor(private readonly leonardoService: LeonardoService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, cb) => {
          const uniqueSuffix = Date.now() + extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}`);
        },
      }),
    }),
  )
  async cartoonify(@UploadedFile() file: Express.Multer.File) {
    const result = await this.leonardoService.cartoonifyImage(file.path);

    // очистка временного файла
    fs.unlinkSync(file.path);

    return { cartoonImageUrl: result };
  }
}
