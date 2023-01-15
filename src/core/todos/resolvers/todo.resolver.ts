import { Resolver, Mutation, Query, Args, Int } from "@nestjs/graphql";

import { TodoStatus } from "../dto/Status.dto";
import { Todo } from "../dto/Todo.dto";
import { TodoService } from "../services/todo.service";
import { UpdateTodoInput } from "../inputs/UpdateTodo";
import { DeleteTodoInput } from "../inputs/DeleteTodo";
import { UpdateDataInput } from '../inputs/UpdateDataInput';

@Resolver('Todo')
export class TodoResolver {
  constructor(private readonly TodoService: TodoService) { }

  @Query(() => Todo)
  async getTodo(
    @Args('id', {
      type: () => Int,
    })
    id,
  ) {
    return this.TodoService.findOne(id);
  }

  @Query(() => [Todo])
  async getTodos() {
    return this.TodoService.findAll();
  }

  @Query(() => [Todo])
  async getTodosByStatus(
    @Args('status', {
      type: () => TodoStatus,
    })
    status,
  ) {
    return this.TodoService.findByStatus(status);
  }

  @Mutation(() => Todo)
  async createTodo(@Args('data', { nullable: false }) data: UpdateDataInput) {
    return this.TodoService.createTodo(data);
  }

  @Mutation(() => Todo)
  async updateTodo(
    @Args('params', { type: () => UpdateTodoInput })
    params: UpdateTodoInput,
  ) {
    return this.TodoService.updateTodo(params);
  }

  @Mutation(() => Todo)
  async deleteTodo(
    @Args('where', { type: () => DeleteTodoInput }) where: DeleteTodoInput,
  ) {
    return this.TodoService.deleteTodo(where);
  }
}
