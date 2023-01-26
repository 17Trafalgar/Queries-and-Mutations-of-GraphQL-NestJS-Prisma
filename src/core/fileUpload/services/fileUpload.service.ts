import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { createWriteStream } from 'fs';
import { PrismaService } from 'src/database/prisma.service';
import {
  CreateFileInput,
  Resources,
  ResponseFileSource,
} from '../types/fileUpload.types';

@Injectable()
export class FileUploadService {
  constructor(private prisma: PrismaService) {}

   randomNum(min, max) {
    return Math.floor(Math.random() * (max - min)) + min; // You can remove the Math.floor if you don't want it to be an integer
  }


  async createFile({ file }: CreateFileInput): Promise<Resources> {
    const { createReadStream, filename } = file;
    try {
      await new Promise((resolve, reject) =>
        createReadStream()
          .pipe(createWriteStream(`./uploads/${filename}`))
          .on('finish', resolve)
          .on('error', reject),
      );
      return await this.uploadDataInToDB(
        'userId',
        `./uploads/${filename}`,
        filename,
      );
    } catch (error) {
      throw new HttpException(`Could not save image, ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  async uploadFormDataInToCDN(
    baseUrl: string,
    bucket: string,
    formData: FormData,
  ): Promise<ResponseFileSource> {
    const url = baseUrl + '/' + bucket;

    /* const headers = formData.getHeaders(); */
    // headers['Authorization'] = req.headers['authorization'];

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      const data: ResponseFileSource = await response.json();
      return data;
    } catch (er) {
      throw er;
    }
  }

  async uploadDataInToDB(
    userId: string,
    cdnBucket: string,
    resourceId: string,
  ) {
    console.log('uploading into db');
    return this.prisma.resources.create({
      data: {
        userId,
        cdnBucket,
        resourceId,
      },
    });
  }

  async deleteDataInToDB(resourceId: string) {
    return await this.prisma.resources.delete({
      where: {
        resourceId,
      },
    });
  }
}
