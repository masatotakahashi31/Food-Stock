//Prismaクライアントを読み込み
import StockList from '@/components/StockList'
import {prisma} from '@/lib/prisma'
//ページ遷移用のLinkコンポーネントを読み込み
import Link from 'next/link'

//在庫一覧画面を表示する関数を定義
export default async function FridgePage(){
  //stock テーブルからデータを複数取得
  const stocks = await prisma.stock.findMany({
    //関連するテーブルのデータを一緒に取得する指示
    include: {
      //stock に直接紐付いている food テーブルのデータを取得
      food: {
        //さらに food テーブルに紐付いているデータを取得
        include: {
          category: true,
        },
      },
    },
    //消費期限の昇順（古い順）に並び替えます。
    orderBy: {expirationDate: 'asc'},
  })

  return(
    <div>
      <h2>冷蔵庫の在庫一覧</h2>
      <Link href="/fridge/new">新しい食材を登録</Link>
      <StockList initialStocks={stocks} />
    </div>
  )
}