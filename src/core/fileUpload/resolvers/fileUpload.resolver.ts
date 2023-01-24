import { HttpStatus } from '@nestjs/common';
import { Mutation, Resolver, Args } from '@nestjs/graphql';
import { FileUploadService } from '../services/fileUpload.service';
import { GraphQLUpload } from 'graphql-upload';
import axios from 'axios';
import { IUpload } from '../interfaces/upload.interface';
import { Stream } from 'stream';
import { ResponseFileSource } from '../types/fileUpload.types';

async function streamBuffering(stream: Stream): Promise<string> {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString()));
  });
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

    const resource = await this.FUService.uploadFormDataInToCDN(
      cdnUrl,
      cdnBucket,
      data,
    );
    if (!resource.ids.length)
      throw new console.error(
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
            new console.error(
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
    const resources: ResponseFileSource =
      await this.FUService.uploadFormDataInToCDN(cdnUrl, cdnBucket, formData);
    console.log('CDN Response:', resources);
    // Throws an error if not all required files were uploaded successfully
    if (resources.ids.length !== files.length)
      throw new console.error(
        `Files weren't uploaded correctly`,
        HttpStatus.EXPECTATION_FAILED,
      );

    const uploadProcesses = resources.ids.map((id) =>
      this.FUService.uploadDataInToDB('userId', cdnBucket, id),
    );

    return new Promise((res, rej) => {
      Promise.all(uploadProcesses)
        .then(res)
        .catch(() =>
          rej(
            new console.error(
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
            new console.error(
              `Files weren't deleted correctly`,
              HttpStatus.EXPECTATION_FAILED,
            ),
          ),
        );
    });
  }
}
