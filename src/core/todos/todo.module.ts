import { Module } from "@nestjs/common";
import { TodoService } from './services/todo.service';
import { TodoResolver } from './resolvers/todo.resolver';
import { PrismaService } from '../../database/prisma.service';

@Module({
	providers: [TodoService, TodoResolver, PrismaService],
	exports: [TodoService]
})
export class TodoModule {}