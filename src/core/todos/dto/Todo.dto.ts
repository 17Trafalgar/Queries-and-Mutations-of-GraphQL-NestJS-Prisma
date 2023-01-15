import { Field, InputType, ObjectType, Int } from "@nestjs/graphql";
import { TodoStatus } from "./Status.dto";

@InputType()
@ObjectType("TodoOutput")
export class Todo {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  name: string;

  @Field(() => String)
  description: string;

  @Field(() => Int)
  expires: number;

  @Field(() => Boolean)
  isCompleted: boolean;

  @Field(() => TodoStatus)
  status: TodoStatus;
}
