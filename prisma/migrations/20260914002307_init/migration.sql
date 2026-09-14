/*
  Warnings:

  - A unique constraint covering the columns `[food_name]` on the table `food` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "food_food_name_key" ON "food"("food_name");
