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
  


  async paintImage(description: string, imagePath: string): Promise<string> {
    console.log('paintImage:======', description);
    const convertedImagePath = await this.convertToPngWithAlpha(imagePath);
    const maskPath = await this.createFullTransparentMask(convertedImagePath); // Create the mask!

    const response = await this.openai.images.edit({
      image: fs.createReadStream(convertedImagePath),
      mask: fs.createReadStream(maskPath), // Pass the mask here!  This is CRITICAL.
      prompt: description,
      n: 1,
      size: '512x512',
      response_format: 'url',
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
  
    fs.unlinkSync(maskPath); // Clean up the mask file!
    fs.unlinkSync(convertedImagePath);
  
    return `/ai-image/${filename}`;
  }
  
  private async convertToPngWithAlpha(imagePath: string): Promise<string> {
    const pngPath = imagePath.replace(/\.(jpg|jpeg)$/i, '.png');
     try {
        await sharp(imagePath)
        .ensureAlpha() // Make sure it has an alpha channel
        .png()
        .toFile(pngPath);
      return pngPath;
     } catch(error){
       console.error("Error in convertToPngWithAlpha", error);
       throw error; // rethrow the error
     }
  }

  private async createFullTransparentMask(imagePath: string): Promise<string> {
    const maskName = `${Date.now()}-${Math.floor(Math.random() * 1000)}-mask.png`;
    const maskPath = path.join(path.dirname(imagePath), maskName);

    // Create a fully transparent black image (the mask)
    await sharp({
        create: {
            width: 512,
            height: 512,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 }, // Fully transparent black
        }
    })
    .png()
    .toFile(maskPath);

    return maskPath;
  }
}
