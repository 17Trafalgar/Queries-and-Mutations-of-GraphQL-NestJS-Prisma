import { OmitType, InputType, Field } from "@nestjs/graphql";
import { Todo } from "../dto/Todo.dto";

@InputType()
export class UpdateDataInput extends OmitType(Todo, ["id"] as const) {}