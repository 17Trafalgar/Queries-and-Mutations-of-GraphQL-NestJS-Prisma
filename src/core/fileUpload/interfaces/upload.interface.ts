import { Contains, IsString } from 'class-validator';
import { ReadStream } from 'fs';
import { Stream } from 'stream';

export interface IUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => Stream;
}

export abstract class FileUploadDto {
  @IsString()
  public filename!: string;

  @IsString()
  @Contains('image/png')
  public mimetype!: string;

  @IsString()
  public encoding!: string;

  public createReadStream: () => ReadStream;
}
