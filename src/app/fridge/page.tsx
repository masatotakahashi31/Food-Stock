import { prisma } from '@/lib/prisma'
import { DbNull } from '@prisma/client/runtime/client'

export default async function FridgePage() {
  // Stock（在庫）テーブルからデータを取得
  const stocks = await prisma.stock.findMany({
    // Stockテーブルには「foodId」しかないので、食材の名前を表示するためにFoodテーブルも結合して取得します
    include: {
      food: true, 
    },
    // 賞味期限（expirationDate）が近い順（昇順）に並び替え
    orderBy: { expirationDate: 'asc' }, 
  })

  return (
    <main style={{ padding: '2rem' }}>
        <h1>DB接続確認</h1>
      <h1>冷蔵庫の在庫一覧({stocks.length} 件)</h1>
      <ul>
        {stocks.map((stock) => (
          <li key={stock.id} style={{ marginBottom: '0.5rem' }}>
            📦 <strong>{stock.food.foodName}</strong> （数量: {stock.stockQuantity}） 
            <br />
            <small style={{ color: 'gray' }}>
              期限: {stock.expirationDate ? stock.expirationDate.toLocaleDateString('ja-JP') : '未設定'} 
              {stock.memo && ` | メモ: ${stock.memo}`}
            </small>
          </li>
        ))}
      </ul>
    </main>
  )
}