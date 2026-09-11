
import { prisma } from '@/lib/prisma'
// データベースに保存するための関数
import { addStock } from '../actions'

import StockForm from '@/components/StockForm'
import Link from 'next/link'

//在庫登録画面を表示するメイン関数を定義
export default async function NewStockPage() {
  const categories = await prisma.category.findMany()
  return (
    <div className="mt-10 mb-5">
      <h2 className="ml-8 text-xl">在庫の登録</h2>
      {/* 切り出したフォーム部品に、 */}
        {/* 「カテゴリ一覧」と「新規追加用の関数(addStock)」を渡して表示 */}
      <div>
      <StockForm
      categories={categories} formAction={addStock} />
      </div>
            </div>
    
  )
}