import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as FormData from 'form-data';

@Injectable()
export class PicsartService {
  private readonly API_KEY = process.env.PICSART_API_KEY; // замени на свой ключ
  private readonly ENDPOINT = 'https://api.picsart.io/tools/1.0/cartoonizer';

  async cartoonifyImage(imagePath: string): Promise<Buffer> {
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));
    formData.append('style', 'cartoon1'); // доступны cartoon1, cartoon2, cartoon3
    formData.append('resolution', 'high');

    const response = await axios.post(this.ENDPOINT, formData, {
      headers: {
        ...formData.getHeaders(),
        'x-picsart-api-key': this.API_KEY,
      },
      responseType: 'arraybuffer',
    });

    return response.data;
  }
}
