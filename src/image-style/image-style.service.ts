// ✅ image-style.service.ts
import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';
import axios from 'axios';

@Injectable()
export class ImageStyleService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  


  async paintImage(style: string, imagePath: string): Promise<string> {
    console.log('paintImage:======', style);
    const convertedImagePath = await this.convertToPngWithAlpha(imagePath);
    const maskPath = await this.createFullTransparentMask(convertedImagePath);

  

    const response = await this.openai.images.createVariation({
      image: fs.createReadStream(convertedImagePath),
      n: 1,
      size: '512x512',
    });
  
    const imageUrl = response.data[0]?.url;
    if (!imageUrl) throw new Error('No image URL received from OpenAI');
  
    const res = await axios.get(imageUrl, { responseType: 'stream' });
  
    const filename = `${Date.now()}-variation.png`;
    const outputPath = path.join(__dirname, '..', '..', 'ai-image', filename);
  
    const writer = fs.createWriteStream(outputPath);
    res.data.pipe(writer);
  
    await new Promise<void>((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  
    fs.unlinkSync(convertedImagePath);
  
    return `/ai-image/${filename}`;
  }
  



  private async convertToPngWithAlpha(originalPath: string): Promise<string> {
    const outputName = `${Date.now()}-${Math.floor(Math.random() * 1000)}-converted.png`;
    const outputPath = path.join(path.dirname(originalPath), outputName);
    
    await sharp(originalPath)
      .ensureAlpha()
      .toColourspace('rgba')
      .resize(512, 512)
      .png({ palette: false })
      .toFile(outputPath);

    return outputPath;
  }

  private async createFullTransparentMask(fromPath: string): Promise<string> {
    const maskPath = fromPath.replace('.png', '-mask.png');

    const { width, height } = await sharp(fromPath).metadata();

    await sharp({
      create: {
        width: width || 512,
        height: height || 512,
        channels: 4 as 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .png()
      .toFile(maskPath);

    return maskPath;
  }
}
