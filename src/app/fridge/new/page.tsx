
import { prisma } from '@/lib/prisma'
// データベースに保存するための関数
import { addStock } from '../actions'

import StockForm from '@/components/StockForm'

//在庫登録画面を表示するメイン関数を定義
export default async function NewStockPage() {
  const categories = await prisma.category.findMany()
  return (
    <div>
      <h2>在庫の登録</h2>
      切り出したフォーム部品に、
        {/* 「カテゴリ一覧」と「新規追加用の関数(addStock)」を渡して表示 */}
      <StockForm categories={categories} formAction={addStock} />
    </div>
  )
}