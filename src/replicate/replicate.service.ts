// src/replicate/replicate.service.ts
import { Injectable } from '@nestjs/common';
import * as FormData from 'form-data';
import fetch from 'node-fetch';

@Injectable()
export class ReplicateService {
  private replicateApiToken = process.env.REPLICATE_API_TOKEN;

  async uploadToTmpFiles(file: Express.Multer.File): Promise<string> {
    const form = new FormData();
    form.append('file', file.buffer, file.originalname);
  
    const res = await fetch('https://tmpfiles.org/api/v1/upload', {
      method: 'POST',
      body: form as any,
    });
  
    const json = await res.json() as { data: { url: string } };
  
    if (!json.data?.url) {
      throw new Error(`tmpfiles.org upload error: ${JSON.stringify(json)}`);
    }
  
    return json.data.url; // это публичный URL
  }
  

async runInferenceWithImage({
  file,
  prompt,
}: {
  file: Express.Multer.File;
  prompt: string;
}) {
  console.log('Run FLUX Kontext Pro');

  // 🔵 1) Загружаем файл
  const imageUrl = await this.uploadToTmpFiles(file);

  // ✅ Обязательно прямая HTTPS dl-ссылка!
  const finalImageUrl = imageUrl.replace(
    'http://tmpfiles.org/',
    'https://tmpfiles.org/dl/'
  );

  // 🔵 2) Запускаем генерацию
  const res = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Token ${this.replicateApiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version:
        '0f1178f5a27e9aa2d2d39c8a43c110f7fa7cbf64062ff04a04cd40899e546065',
      input: {
        input_image: finalImageUrl,
        prompt:
          prompt ||
          'Turn this photo into a colorful cartoon style illustration, smooth lines, vivid colors, clear outlines, looks like a hand-drawn animation character.',
      },
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(`Replicate error: ${JSON.stringify(error)}`);
  }

  const prediction = await res.json() as any;
  console.log('Prediction started, ID:', prediction.id);

  const getUrl = prediction.urls.get;

  // 🔵 3) Поллинг
  let status = prediction.status;
  let output = null;

  while (
    status !== 'succeeded' &&
    status !== 'failed' &&
    status !== 'canceled'
  ) {
    console.log(`Status: ${status}...`);
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const pollRes = await fetch(getUrl, {
      headers: {
        Authorization: `Token ${this.replicateApiToken}`,
      },
    });
    const pollJson = await pollRes.json() as any;
    status = pollJson.status;
    output = pollJson.output;
  }

  if (status === 'succeeded') {
    console.log('✅ Final output:', output);
    return output;
  } else {
    throw new Error(`Replicate generation failed with status: ${status}`);
  }
}

}
