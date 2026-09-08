//Prismaクライアントを読み込み
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
      <ul>
        {/* 取得した stocks のデータを1件ずつ取り出してループ処理 */}
        {stocks.map((stock) => (
          // リストの1項目(被らない一意のキー)
          <li key={stock.id}>
            {/* 在庫の数量に加え、food を経由してたどり着いた食材名とcategoryのカテゴリ名をそれぞれ表示します。 */}
            食材: {stock.food.foodName}/ カテゴリー: {stock.food.category.categoryName}/ 数量: {stock.stockQuantity}
            {/* 消費期限のデータが存在する場合のみ表示する条件分岐 */}
            {stock.expirationDate && (
              // 消費期限を日本の日付形式にフォーマットして表示
// 左側がデータあり（True）の場合: 右側の (<span>...</span>) に進んで、中の文字をすべて画面に表示します。
// 左側がデータなし（null や false）の場合: その時点で処理を打ち切り、右側の (<span>...</span>) をタグごと読み込みません。
              <span> / 期限: {stock.expirationDate.toLocaleDateString('ja-JP')}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}