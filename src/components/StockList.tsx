"use client"

// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// ① インポート（必要な部品の読み込み）
// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
import {useState} from 'react'
import {deleteStockById} from '@/app/fridge/actions'
import Link from 'next/link'
import QuickAddButton from './QuickAddButton'


// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// ② 型定義（データルールの設定）
// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// 1. カテゴリの型
type Category = {
  id: number
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


// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// ③ メインコンポーネント（画面の描画と操作）
// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// StockList部品の本体。親から送られてきた箱（initialStocks）をルール(Props)通りに受け取り
export default function StockList({initialStocks}: Props){
    
    // 親からもらった最初のデータ(initialStocks)を、自分のメモ帳(stocks)に丸写し
    // setstocksはこのメモ帳を書き換えるための専用の関数
    const [stocks, setstocks] = useState(initialStocks)

    // ----------------------------------------------------
    // アクション：消費期限からハイライト色を計算する
    // ----------------------------------------------------
    // 消費期限（expirationDate）」を受け取って、それに合わせた「色の設定（スタイル）」を返す関数
    const getHighlightStyle = (expirationDate: Date | null) => {
        // 消費期限が登録されていなければ（null)なら、何も色をつけない
        if (!expirationDate) return {}

        // 現在の「日付と時間（例：2026年9月10日 15:33）」を取得
        const today = new Date()
        // 時間を「0時0分0秒0ミリ秒」にリセットします。これをしないと、「今日の夕方」と「今日の朝」の比較でズレが生じてしまうため、純粋に「日付」で判定
        today.setHours(0, 0, 0, 0)

        // 食材の「消費期限」も日付データに変換し、時間を「0時0分0秒0ミリ秒」にリセット
        const expDate = new Date(expirationDate)
        expDate.setHours(0, 0, 0, 0)

        // 日数の差を計算
        // .getTime() を使うと、日付を「1970年から何ミリ秒経ったか」というとんでもなく大きな数字に変換できます。その数字同士を引き算して、「2つの日付の差（ミリ秒）」を出します
        const diffTime = expDate.getTime() - today.getTime()
        // さっき計算したミリ秒を、「日数」に直します。
        // （1000ミリ秒 × 60秒 × 60分 × 24時間 ＝ 1日）。Math.ceil は端数が出た時のための切り上げ処理
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        // ▼ 日数によって色を変える
        // もし計算した日数が0より小さければ（マイナスなら）、すでに期限を過ぎているので、背景を薄い赤、文字を
        if (diffDays < 0) {
            // すでに期限切れ：薄い赤色の背景と、濃い赤の文字
            return { backgroundColor: '#ffe4e6', color: '#e11d48', padding: '10px', borderRadius: '5px' }
        // 2日以内：薄い黄色の背景と、濃いオレンジの文字
        } else if (diffDays <= 2) {
            return { backgroundColor: '#fef3c7', color: '#d97706', padding: '10px', borderRadius: '5px' }
        }

        // 上のどちらにも当てはまらない（期限まで3日以上ある）場合は、色を変えず、少しだけ余白（padding）をつける設定
        return { padding: '10px' } 
    }

    // ----------------------------------------------------
    // アクション：削除ボタンが押された時の処理
    // ----------------------------------------------------
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


    // ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
    // ④ 画面の表示（HTML / UI部分）
    // ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
    return(
        <ul>
            {/* 取得した stocks のデータを1件ずつ取り出してループ処理 */}
            {stocks.map((stock) => (
                // リストの1項目(被らない一意のキー)
                <li key={stock.id}
                    // スプレッド構文） が超重要です！これは「関数から返ってきた箱（オブジェクト）の中身を展開して、ここに並べる
                    style={{ marginBottom: '15px', ...getHighlightStyle(stock.expirationDate)}}
                >
                    {/* 在庫の数量に加え、food を経由してたどり着いた食材名とcategoryのカテゴリ名をそれぞれ表示します。 */}
                    {/* strongは太字 */}
                    <strong>食材: {stock.food.foodName}</strong>/ カテゴリー: {stock.food.category.categoryName}/ 数量: {stock.stockQuantity}
                    
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
                    
                    <span style={{ marginLeft: '15px' }}>
                        {/* ★ ワンタップ追加ボタン */}
                        {/* QuickAddButton という部品（コンポーネント）をここに呼び出して配置 */}
                        <QuickAddButton 
                            // 食材のカテゴリIDはこれだよ」とデータを渡して
                            categoryId={stock.food.category.id} 
                            // この食材の名前（例：にんじん）はこれだよ」とデータを渡しています
                            itemName={stock.food.foodName} 
                            // 買い物リストには『1個』追加してね」とデータを渡しています
                            quantity={1} 
                        />
                        <Link
                            href={`/fridge/${stock.id}/edit`}
                            style={{color: 'blue', marginLeft: '10px'}}
                        >
                            編集
                        </Link>
                        <button
                            onClick={() => handleDelete(stock.id)}
                            style={{color:'red',marginLeft:'10px'}}
                        >
                            削除
                        </button>
                    </span>
                </li>
            ))}
        </ul>
    )
}