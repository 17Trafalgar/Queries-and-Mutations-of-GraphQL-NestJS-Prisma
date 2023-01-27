import { Field, ObjectType, InputType } from '@nestjs/graphql';
import { GraphQLUpload } from 'graphql-upload';
import { IUpload } from '../interfaces/upload.interface';

@InputType()
export class CreateFileInput {
  @Field(() => GraphQLUpload)
  file: IUpload;
}
@ObjectType('ResourcesOutput')
export class Resources {
  @Field(() => String)
  userId: string;

  @Field(() => String)
  cdnBucket: string;

  @Field(() => String)
  resourceId: string;
}
