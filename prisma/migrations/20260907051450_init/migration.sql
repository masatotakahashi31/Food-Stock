-- CreateTable
CREATE TABLE "category" (
    "id" SERIAL NOT NULL,
    "category_name" VARCHAR(100) NOT NULL,
    "is_food" BOOLEAN NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food" (
    "id" SERIAL NOT NULL,
    "food_name" VARCHAR(100) NOT NULL,
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "food_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock" (
    "id" SERIAL NOT NULL,
    "food_id" INTEGER NOT NULL,
    "expiration_date" DATE,
    "stock_quantity" INTEGER NOT NULL,
    "purchase_date" DATE NOT NULL,
    "memo" VARCHAR(100),

    CONSTRAINT "stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shopping" (
    "id" SERIAL NOT NULL,
    "item_name" VARCHAR(100) NOT NULL,
    "category_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "is_purchased" BOOLEAN NOT NULL DEFAULT false,
    "add_type" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shopping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "category_category_name_key" ON "category"("category_name");

-- AddForeignKey
ALTER TABLE "food" ADD CONSTRAINT "food_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock" ADD CONSTRAINT "stock_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "food"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping" ADD CONSTRAINT "shopping_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
