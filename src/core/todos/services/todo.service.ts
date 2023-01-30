import { Injectable } from '@nestjs/common';
import { Prisma, Status, Todo } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class TodoService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: number): Promise<Todo | null> {
    return this.prisma.todo.findUnique({
      where: {
        id,
      },
    });
  }

  async findAll(): Promise<Todo[]> {
    return this.prisma.todo.findMany();
  }

  async findByStatus(status: Status): Promise<Todo[]> {
    return this.prisma.todo.findMany({
      where: {
        status,
      },
    });
  }

  async createTodo(data: Prisma.TodoCreateInput): Promise<Todo> {
    return this.prisma.todo.create({
      data,
    });
  }

  async updateTodo(params: {
    where: Prisma.TodoWhereUniqueInput;
    data: Prisma.TodoUpdateInput;
  }): Promise<Todo> {
    const { where, data } = params;
    return this.prisma.todo.update({
      data,
      where,
    });
  }

  async deleteTodo(where: Prisma.TodoWhereUniqueInput): Promise<Todo> {
    return this.prisma.todo.delete({
      where,
    });
  }
}
