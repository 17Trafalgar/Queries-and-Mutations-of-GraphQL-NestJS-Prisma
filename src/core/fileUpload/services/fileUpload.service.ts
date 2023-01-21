import { Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';

import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class FileUploadService {
  constructor(private prisma: PrismaService) {}

  async uploadFormDataInToCDN(
    baseUrl: string,
    bucket: string,
    data: FormData,
  ): Promise<Response> {
    const url = baseUrl + '/' + bucket;

    const opts: AxiosRequestConfig = {
      method: 'POST',
      url,
      data,
      headers: {
        ...data.getHeaders(),
        // 'Authorization': req.headers['authorization'],
      },
    };

    return new Promise<Response>((resolve, reject) =>
      axios<Response>(opts)
        .then(({ data }) => resolve(data))
        .catch((er) => reject(er)),
    );
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
        cdnBucket,
        resourceId,
      },
    });
  }
}
