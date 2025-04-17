import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as FormData from 'form-data';
import { extname } from 'path';

@Injectable()
export class LeonardoService {
  private readonly apiKey = process.env.LEONARDO_API_KEY;
  private readonly modelId = process.env.LEONARDO_MODEL_ID;

  private async uploadImage(imagePath: string): Promise<string> {
    const form = new FormData();
    const extension = extname(imagePath).slice(1); // jpg, jpeg, png и т.д.
    form.append('file', fs.createReadStream(imagePath));
    form.append('extension', extension);

    try {
      const response = await axios.post(
        'https://cloud.leonardo.ai/api/rest/v1/init-image',
        form,
        {
          headers: {
            ...form.getHeaders(),
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      return response.data?.uploadInitImage?.init_image_id;
    } catch (err) {
      console.log('🛑 Ошибка при загрузке изображения в Leonardo:');
      throw new InternalServerErrorException('Ошибка при загрузке изображения в Leonardo');
    }
  }

  async cartoonifyImage(imagePath: string): Promise<string> {
    console.log('cartoonifyImage----', imagePath);
    const initImageId = await this.uploadImage(imagePath);

    console.log('uploadImage----');
    const generationResponse = await axios.post(
      'https://cloud.leonardo.ai/api/rest/v1/generations',
      {
        init_image_id: initImageId,
        "prompt": "Cartoon-style transformation of the original photo, preserving the exact number of people and their positions, Pixar 3D animation style, soft textures, expressive eyes, warm lighting.",
        "modelId": this.modelId,
        "width": 512,
        "height": 512,
        "num_images": 1,
        "init_strength": 0.35,
        "guidance_scale": 7,
        "promptMagic": false,
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const generationId = generationResponse.data?.sdGenerationJob?.generationId;
    if (!generationId) {
      throw new InternalServerErrorException('Не удалось получить generationId');
    }

    console.log('🌀 Ожидаем генерацию...');
    const imageUrl = await this.pollForImage(generationId);

    if (!imageUrl) {
      throw new InternalServerErrorException('Не удалось получить мультяшное изображение');
    }

    return imageUrl;
  }

  private async pollForImage(generationId: string, timeoutMs = 180000): Promise<string | null> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      const response = await axios.get(
        `https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      const status = response.data?.generations_by_pk?.status;
      const imageUrl = response.data?.generations_by_pk?.generated_images?.[0]?.url;

      if (status === 'COMPLETE' && imageUrl) {
        return imageUrl;
      }

      if (status === 'FAILED') {
        console.log('🛑 Генерация провалена');
        return null;
      }

      await new Promise((res) => setTimeout(res, 3000)); // ⏳ подождать 2 сек
    }

    console.log('⏱ Таймаут генерации');
    return null;
  }
}
