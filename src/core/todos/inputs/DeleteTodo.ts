import { Field, InputType } from '@nestjs/graphql';
import { WhereInput } from './WhereInput';

@InputType()
export class DeleteTodoInput {
  @Field({ nullable: false })
  id?: number;
}
