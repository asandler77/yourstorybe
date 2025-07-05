import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    Res,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { Response } from 'express';
  import { PicsartService } from './picsart.service';
  import * as fs from 'fs';
  import * as path from 'path';
  
  @Controller('picsart')
  export class PicsartController {
    constructor(private readonly picsartService: PicsartService) {}
  
    @Post('cartoonify')
    @UseInterceptors(FileInterceptor('file'))
    async cartoonify(
      @UploadedFile() file: Express.Multer.File,
      @Res() res: Response,
    ) {
      const tempDir = path.join(__dirname, '..', 'temp');
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
  
      const tempPath = path.join(tempDir, file.originalname);
      fs.writeFileSync(tempPath, file.buffer);
  
      const cartoonBuffer = await this.picsartService.cartoonifyImage(tempPath);
      fs.unlinkSync(tempPath); // удаляем временный файл
  
      res.setHeader('Content-Type', 'image/jpeg');
      res.send(cartoonBuffer);
    }
  }
  