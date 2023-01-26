import { registerEnumType } from '@nestjs/graphql';

export enum TodoStatus {
  COMPLETED = 'COMPLETED',
  INPROGRESS = 'INPROGRESS',
  PENDING = 'PENDING',
}

registerEnumType(TodoStatus, {
  name: 'TodoStatus',
});
