import GraphQLUpload from 'graphql-upload/GraphQLUpload';
import { FileUploadService } from '../fileUpload/fileUpload.service';
import axios, { AxiosRequestConfig } from 'axios';
import { IUpload } from '../fileUpload/interfaces/upload.interface';
import FormData from 'form-data';
import { HttpStatus } from '@nestjs/common';
import { Mutation, Resolver, Args } from '@nestjs/graphql';
import {GqlHttpEx}

function streamBuffering(stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

type ResponseFileSource = {
    urls: string[],
    ids: string[]
}

const uploadFormDataInToCDN = <Response>(baseUrl: string, bucket: string, data: FormData): Promise<Response> => {
    const url = baseUrl + '/' + bucket;

    const opts: AxiosRequestConfig = {
        method: 'POST',
        url,
        data,
        headers: {
            ...data.getHeaders(),
            // 'Authorization': req.headers['authorization'],
        }
    };

    return new Promise<Response>((resolve, reject) =>
        axios<Response>(opts)
            .then(({ data }) => resolve(data))
            .catch((er) => reject(er))
    );
};


const uploadDataInToDB = (userId: string, cdnBucket: string, resourceId: string) => {
    console.log('uploading into db')
    return prisma.resources.create({
        data: {
            userId,
            cdnBucket,
            resourceId
        }
    })
}

@Resolver()
export class FileResolver {
  constructor(private readonly FUService: FileUploadService) {}

  @Mutation(() => File)
  async uploadFile(
    @Args({ name: 'file', type: () => GraphQLUpload }) file: IUpload,
  ) {
    const { filename, createReadStream } = file;
    const bf = await streamBuffering(createReadStream());

    const data = new FormData();
    data.append('file', bf, filename);

    const cdnUrl = 'https://';
    const cdnBucket = 'site-content';

    const resource =
      await this.FUService.uploadFormDataInToCDN<ResponseFileSource>(
        cdnUrl,
        cdnBucket,
        data,
      );
    if (!resource.ids.length)
      throw new GqlHttpException(
        `File wasn't uploaded correctly`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );

    const uploadProcess = this.FUService.uploadDataInToDB(
      'userID',
      cdnBucket,
      resource.ids[0],
    );

    return new Promise((res, rej) => {
      uploadProcess
        .then(() => res(resource))
        .catch(() =>
          rej(
            new GqlHttpException(
              `File wasn't saved correctly`,
              HttpStatus.SERVICE_UNAVAILABLE,
            ),
          ),
        );
    });
  }

  @Mutation(() => File)
  async uploadFiles(
    @Args('files', { type: () => [GraphQLUpload] })
    fileList: Promise<IUpload>[],
  ) {
    const files: IUpload[] = await Promise.all(fileList);
    const formData = new FormData();

    const cdnUrl = 'https:';
    const cdnBucket = 'site-content';

    // appends files into formData
    const filesLen = files.length;
    for (let i = 0; i < filesLen; i++) {
      const { createReadStream, filename } = files[i];
      const bf = await streamBuffering(createReadStream());
      formData.append('file', bf, filename);
    }

    // uploads files into CDN and receives resources
    const resources =
      await this.FUService.uploadFormDataInToCDN<ResponseFileSource>(
        cdnUrl,
        cdnBucket,
        formData,
      );
    console.log('CDN Response:', resources);
    // Throws an error if not all required files were uploaded successfully
    if (resources.ids.length !== files.length)
      throw new Error('error');

    const uploadProcesses = resources.ids.map((id) =>
      this.FUService.uploadDataInToDB('userId', cdnBucket, id),
    );

    return new Promise((res, rej) => {
      Promise.all(uploadProcesses)
        .then(res)
        .catch(() =>
          rej(
            new GqlHttpException(
              `Files weren't saved correctly`,
              HttpStatus.EXPECTATION_FAILED,
            ),
          ),
        );
    });
  }

  @Mutation(() => Boolean)
  async deleteFile(
    @Args('url', { type: () => String })
    resourceURL: string,
  ) {
    const protocol = 'https://';
    const url = new URL(
      resourceURL.startsWith(protocol) ? resourceURL : protocol + resourceURL,
    );
    const [cdnBucket, resourceId] = url.pathname.split('/');

    const deletingFromCDN = axios.delete(url.href);
    const deletingFromDB = await this.FUService.deleteDataInToDB(
      cdnBucket,
      resourceId,
    );

    return new Promise((resolve, reject) => {
      Promise.all([deletingFromCDN, deletingFromDB])
        .then(() => resolve(true))
        .catch(() =>
          reject(
            new GqlHttpException(
              `Files weren't deleted correctly`,
              HttpStatus.EXPECTATION_FAILED,
            ),
          ),
        );
    });
  }
}