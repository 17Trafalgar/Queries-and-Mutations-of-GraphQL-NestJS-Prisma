import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class WhereInput {
  @Field()
  id?: number;
}
