import { PrismaPg } from '@prisma/adapter-pg';
import {PrismaClient} from '@/generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL as string });
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. 既存データを削除 (子テーブル → 親テーブルの順に消すこと)
  await prisma.stock.deleteMany();
  await prisma.shopping.deleteMany();
  await prisma.food.deleteMany();
  await prisma.category.deleteMany();

  console.log('既存のデータを全て削除しました。');

  // 2. カテゴリデータの作成
  const categoryMeat = await prisma.category.create({
    data: { categoryName: '肉類', isFood: true },
  });
  const categoryVeg = await prisma.category.create({
    data: { categoryName: '野菜類', isFood: true },
  });
  const categoryDaily = await prisma.category.create({
    data: { categoryName: '日用品', isFood: false },
  });

  // 3. 食品マスタデータの作成
  const foodPork = await prisma.food.create({
    data: { foodName: '豚バラ肉', categoryId: categoryMeat.id },
  });
  const foodCabbage = await prisma.food.create({
    data: { foodName: 'キャベツ', categoryId: categoryVeg.id },
  });

  // 4. 冷蔵庫在庫(Stock)データの作成
  const today = new Date();
  
  // 3日後（期限間近のテスト用）
  const threeDaysLater = new Date(today);
  threeDaysLater.setDate(today.getDate() + 3);

  // 7日後（通常のテスト用）
  const sevenDaysLater = new Date(today);
  sevenDaysLater.setDate(today.getDate() + 7);

  await prisma.stock.create({
    data: {
      foodId: foodPork.id,
      expirationDate: threeDaysLater,
      stockQuantity: 1,
      purchaseDate: today,
      memo: '週末の鍋用',
    },
  });

  await prisma.stock.create({
    data: {
      foodId: foodCabbage.id,
      expirationDate: sevenDaysLater,
      stockQuantity: 1,
      purchaseDate: today,
    },
  });

  // 5. お買い物リスト(Shopping)データの作成
  await prisma.shopping.create({
    data: {
      itemName: '食器用洗剤',
      categoryId: categoryDaily.id,
      quantity: 1,
      isPurchased: false,
      addType: '手動追加',
    },
  });

  console.log('シードデータの投入が完了しました！');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });