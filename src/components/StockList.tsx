"use client"

import {useState} from 'react'
import {deleteStockById} from '@/app/fridge/actions'
import Link from 'next/link'

// 1. カテゴリの型
type Category = {
  categoryName: string
}

// 2. 食材の型（中にカテゴリを含む）
type Food = {
  foodName: string
  category: Category
}

// 3. 在庫の型（中に食材を含む）
type Stock = {
  id: number
  stockQuantity: number
  expirationDate: Date | null
  purchaseDate: Date | null
  memo: string | null
  food: Food
}

// 4. Propsの型（Stock の配列）
// initialStocks という名前の箱には、上で作った Stock 型の「配列（[]＝複数データ）」が入る
type Props = {
  initialStocks: Stock[]
}

// StockList部品の本体。親から送られてきた箱（initialStocks）をルール(Props)通りに受け取り
export default function StockList({initialStocks}: Props){
    // 親からもらった最初のデータ(initialStocks)を、自分のメモ帳(stocks)に丸写し
    // setstocksはこのメモ帳を書き換えるための専用の関数
    const [stocks, setstocks] = useState(initialStocks)

    // 削除ボタンが押された時に動く関数（引数として、押された項目の id を受け取り
    const handleDelete = async (id: number) =>{
        // 今のメモ帳(stocks)の中から、「押されたidとは『違う(!==)』データ」だけを残した新しいリストを作り
        // 押されたデータが除外されたリスト
        const newStocks = stocks.filter((stock) => stock.id !== id)
        // (setstocks)を使って、メモ帳をさっき作った「新しいリスト」に書き換え
        setstocks(newStocks)
        // 裏側の処理(deleteStockById)を呼び出し、データベースからもこっそり削除します。
        await deleteStockById(id)
    }

    return(
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
        // &&の左側がデータなし（null や false）の場合: その時点で処理を打ち切り、右側の (<span>...</span>) をタグごと読み込みません。
                      <span> / 期限: {stock.expirationDate.toLocaleDateString('ja-JP')}</span>
                    )}
                    {/* memoのデータが存在する場合のみ表示する条件分岐 */}
                    {stock.memo && (
        // &&の左側がデータあり（True）の場合: 右側の (<span>...</span>) に進んで、中の文字をすべて画面に表示します。
        // &&の左側がデータなし（null や false）の場合: その時点で処理を打ち切り、右側の (<span>...</span>) をタグごと読み込みません。
                      <span> / メモ: {stock.memo}</span>
                    )}
                    {stock.purchaseDate && (
        // &&の左側がデータあり（True）の場合: 右側の (<span>...</span>) に進んで、中の文字をすべて画面に表示します。
        // &&の左側がデータなし（null や false）の場合: その時点で処理を打ち切り、右側の (<span>...</span>) をタグごと読み込みません。
                      <span> / 購入日: {stock.purchaseDate.toLocaleDateString('ja-JP')}</span>
                    )}
                    <Link
                        href={`/fridge/${stock.id}/edit`}
                        style={{color: 'blue', marginLeft: '10px'}}
                        >編集</Link>
                    <button
                    onClick={() => handleDelete(stock.id)}
                    style={{color:'red',marginLeft:'10px'}}
                    >削除</button>
                  </li>
                ))}
              </ul>
    )
}
