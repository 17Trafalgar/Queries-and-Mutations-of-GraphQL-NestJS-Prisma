import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ResponseFileSource } from '../types/fileUpload.types';

@Injectable()
export class FileUploadService {
  constructor(private prisma: PrismaService) {}

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

  async deleteDataInToDB(cdnBucket: string, resourceId: string) {
    return await this.prisma.resources.delete({
      where: {
        resourceId,
      },
    });
  }
}
