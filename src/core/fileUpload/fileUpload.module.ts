import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { FileResolver } from './fileUpload.resolver';
import { FileUploadService } from './fileUpload.service';

@Module({
  providers: [FileResolver, PrismaService, FileUploadService],
  exports: [FileUploadService],
})
export class UploadModule {}
