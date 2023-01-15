-- CreateEnum
CREATE TYPE "Status" AS ENUM ('COMPLETED', 'INPROGRESS', 'PENDING');

-- CreateTable
CREATE TABLE "Todo" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "expires" INTEGER NOT NULL,
    "isCompleted" BOOLEAN NOT NULL,
    "status" "Status" NOT NULL,

    CONSTRAINT "Todo_pkey" PRIMARY KEY ("id")
);
