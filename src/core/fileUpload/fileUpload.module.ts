import { Module } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { FileResolver } from './resolvers/fileUpload.resolver';
import { FileUploadService } from './services/fileUpload.service';

@Module({
  providers: [FileUploadService, FileResolver, PrismaService],
  exports: [FileUploadService],
})
export class FileUploadModule {}
