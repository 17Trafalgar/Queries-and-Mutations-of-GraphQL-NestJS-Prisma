import { FileUploadService } from '../fileUpload/fileUpload.service';
import { GraphQLUpload } from 'graphql-upload';
import { FileUploadDto } from '../fileUpload/interfaces/upload.interface';
import { Mutation, Resolver, Args } from '@nestjs/graphql';
import { Stream } from 'stream';
import { Resources } from '../fileUpload/InputFileUpload/fileupload.model';

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

  @Mutation(() => Resources)
  async uploadFile(
    @Args({ name: 'file', type: () => GraphQLUpload })
    file: FileUploadDto,
  ): Promise<any> {
    const { mimetype } = file;
    if (mimetype.match(/^image\/(jpeg|gif)$/)) {
      return this.FUService.createFile({ file });
    } else {
      throw new Error(`File wasn't mime(${mimetype}) type correctly`);
    }
  }

  @Mutation(() => [Resources])
  async uploadFiles(
    @Args('files', { type: () => [GraphQLUpload] })
    fileList: FileUploadDto[],
  ): Promise<FileUploadDto[]> {
    const files = [];
    (await Promise.all(fileList)).forEach((file) => {
      files.push(this.FUService.createFile({ file }));
    });
    return files;
  }

  @Mutation(() => Boolean)
  async deleteFile(
    @Args('url', { type: () => String })
    resourceId: string,
  ) {
    /*     const protocol = 'https://';
    const url = new URL(
      resourceURL.startsWith(protocol) ? resourceURL : protocol + resourceURL,
    );
    const [cdnBucket, resourceId] = url.pathname.split('/');
    const deletingFromCDN = axios.delete(url.href); */
    const deletingFromDB = await this.FUService.deleteDataInToDB(resourceId);
    return true;
  }
}
