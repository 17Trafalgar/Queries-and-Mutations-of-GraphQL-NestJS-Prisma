import { Field, InputType } from "@nestjs/graphql";
import { WhereInput } from './WhereInput';
import { UpdateDataInput } from './UpdateDataInput';

@InputType()
export class UpdateTodoInput {
  @Field(() => WhereInput)
  where: WhereInput;

  @Field(() => UpdateDataInput, { nullable: false })
  data: UpdateDataInput;
}