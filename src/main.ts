import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Раздача папки uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Раздача папки ai-image
  app.useStaticAssets(join(__dirname, '..', 'ai-image'), {
    prefix: '/ai-image/',
  });

  await app.listen(3000, '0.0.0.0');
}
bootstrap();
