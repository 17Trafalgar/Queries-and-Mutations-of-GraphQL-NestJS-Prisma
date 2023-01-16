import { OmitType, InputType, Field, Int } from '@nestjs/graphql';
import { TodoStatus } from '../dto/Status.dto';
import { Todo } from '../dto/Todo.dto';

//@InputType()
//export class UpdateDataInput extends OmitType(Todo, ["id"] as const) {}

@InputType()
export class UpdateDataInput implements Todo {
  id: number;

  @Field(() => String, { nullable: true })
  name: string;

  @Field(() => String, { nullable: true })
  description: string;

  @Field(() => Int, { nullable: true })
  expires: number;

  @Field(() => Boolean, { nullable: true })
  isCompleted: boolean;

  @Field(() => TodoStatus, { nullable: true })
  status: TodoStatus;
}
